import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppValidators } from '@Validators';
import { ROUTES } from '@constants';
import {
  Email,
  EmailInputConfig,
  Name,
  NameInputConfig,
  DateInput,
  DateInputConfig,
  Dropdown,
  DropdownInputConfig,
  MobileNumber,
  MobileNumberConfig,
  Address,
  AddressConfig,
  Button,
  ButtonInputConfig,
} from '@common';
import { ValidateDirective, FloatingLabelDirective } from '@directives';
import { ToastrService } from 'ngx-toastr';
import {
  ApplyServicePartnerRequest,
  AttachmentRequest,
  Category,
  ExperienceRequest,
  Language,
  ServiceType,
  SubCategory,
  UploadAttachmentResponse,
} from '@ServicePartnerModels';
import { ServicePartnerService } from '@ServicePatnerService';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Name,
    Email,
    DateInput,
    Dropdown,
    MobileNumber,
    Address,
    ValidateDirective,
    FloatingLabelDirective,
    Button,
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  isUploading = false;
  formSubmitted = false;

  profileImageUrl: string | null = null;
  profileImageName: string | null = null;
  profileImageFile: File | null = null;

  serviceTypes: ServiceType[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  languages: Language[] = [];

  selectedSkillIds: number[] = [];
  selectedServiceIds: number[] = [];
  attachments: AttachmentRequest[] = [];
  pendingAttachmentFiles: { file: File; fileName: string }[] = [];
  showSkillDropdown = false;
  skillSearchText = '';
  filteredCategories: Category[] = [];

  fullNameConfig!: NameInputConfig;
  emailConfig!: EmailInputConfig;
  dobConfig!: DateInputConfig;
  fromDateConfig!: DateInputConfig;
  toDateConfig!: DateInputConfig;
  genderConfig!: DropdownInputConfig;
  applyingConfig!: DropdownInputConfig;
  languageConfig!: DropdownInputConfig;
  proficiencyConfig!: DropdownInputConfig;
  mobileConfig!: MobileNumberConfig;
  permanentAddressConfig!: AddressConfig;
  residentialAddressConfig!: AddressConfig;

  addEducationBtnConfig!: ButtonInputConfig;
  addExperienceBtnConfig!: ButtonInputConfig;
  addLanguageBtnConfig!: ButtonInputConfig;
  cancelBtnConfig!: ButtonInputConfig;

  get applyBtnConfig(): ButtonInputConfig {
    return {
      type: 'submit',
      text: 'Apply',
      cssClass: 'btn-apply',
      isLoading: this.isSubmitting,
      disabled: this.isSubmitting,
    };
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicePartnerService: ServicePartnerService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setFormInputConfig();
    this.loadServiceTypes();
    this.loadLanguages();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      fullName: [
        '',
        [Validators.required, Validators.maxLength(150), AppValidators.name],
      ],
      dateOfBirth: [
        '',
        [Validators.required, AppValidators.date, AppValidators.dobNotFuture],
      ],
      gender: ['', Validators.required],
      mobileNumber: [
        '',
        [Validators.required, Validators.maxLength(20), AppValidators.phone],
      ],
      email: ['', [Validators.required, Validators.email, AppValidators.email]],
      applyingForTypeId: ['', Validators.required],
      permanentAddress: ['', [Validators.required, AppValidators.address]],
      residentialAddress: ['', [Validators.required, AppValidators.address]],
      educations: this.fb.array([this.createEducationGroup()]),
      experiences: this.fb.array([this.createExperienceGroup()]),
      languages: this.fb.array([this.createLanguageGroup()]),
    });

    this.form
      .get('applyingForTypeId')!
      .valueChanges.subscribe((serviceTypeId) => {
        this.resetSkillsAndServices();
        if (!serviceTypeId) return;
        this.loadCategoriesByServiceType(serviceTypeId);
      });

    this.form.get('dateOfBirth')!.valueChanges.subscribe((dob: string) => {
      if (dob && /^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        this.fromDateConfig = { ...this.fromDateConfig, minDate: dob };
        this.toDateConfig = { ...this.toDateConfig, minDate: dob };
      } else {
        this.fromDateConfig = { ...this.fromDateConfig, minDate: undefined };
        this.toDateConfig = { ...this.toDateConfig, minDate: undefined };
      }
      this.experiences.controls.forEach((exp) => {
        exp.get('fromDate')?.updateValueAndValidity({ emitEvent: false });
        exp.get('toDate')?.updateValueAndValidity({ emitEvent: false });
      });
      this.educations.controls.forEach((edu) => {
        edu.get('passingYear')?.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  private setFormInputConfig(): void {
    this.fullNameConfig = {
      formControlName: 'fullName',
      placeholder: 'Full Name',
      floating: true,
      showRequired: true,
    };
    this.emailConfig = {
      formControlName: 'email',
      placeholder: 'Email',
      floating: true,
      showRequired: true,
    };
    this.dobConfig = {
      formControlName: 'dateOfBirth',
      placeholder: 'DOB',
      showCalendarIcon: true,
      floating: true,
      disableFuture: true,
      showRequired: true,
    };
    this.fromDateConfig = {
      formControlName: 'fromDate',
      placeholder: 'From',
      showCalendarIcon: true,
      floating: true,
      disableFuture: true,
      showRequired: true,
    };
    this.toDateConfig = {
      formControlName: 'toDate',
      placeholder: 'To',
      showCalendarIcon: true,
      floating: true,
      disableFuture: true,
    };
    this.mobileConfig = {
      formControlName: 'mobileNumber',
      placeholder: 'Mobile Number',
      floating: true,
      showRequired: true,
    };
    this.permanentAddressConfig = {
      formControlName: 'permanentAddress',
      placeholder: 'Permanent Address',
      floating: true,
      showRequired: true,
    };
    this.residentialAddressConfig = {
      formControlName: 'residentialAddress',
      placeholder: 'Residential Address',
      floating: true,
      showRequired: true,
    };
    this.genderConfig = {
      formControlName: 'gender',
      placeholder: 'Gender',
      requiredMsg: 'Gender is required.',
      options: [
        { label: 'Male', value: 0 },
        { label: 'Female', value: 1 },
      ],
    };
    this.applyingConfig = {
      formControlName: 'applyingForTypeId',
      placeholder: 'Applying For',
      requiredMsg: 'Please select a service type.',
      options: [],
    };
    this.languageConfig = {
      formControlName: 'languageId',
      placeholder: 'Language',
      requiredMsg: 'Language is required.',
      options: [],
    };
    this.proficiencyConfig = {
      formControlName: 'proficiency',
      placeholder: 'Proficiency',
      requiredMsg: 'Proficiency is required.',
      options: [
        { label: 'Beginner', value: 0 },
        { label: 'Intermediate', value: 1 },
        { label: 'Expert', value: 2 },
      ],
    };
    this.addEducationBtnConfig = {
      text: '+ Add',
      cssClass: 'btn-add-glass',
      onClick: () => this.addEducation(),
    };
    this.addExperienceBtnConfig = {
      text: '+ Add',
      cssClass: 'btn-add-glass',
      onClick: () => this.addExperience(),
    };
    this.addLanguageBtnConfig = {
      text: '+ Add',
      cssClass: 'btn-add-glass',
      onClick: () => this.addLanguage(),
    };
    this.cancelBtnConfig = {
      text: 'Cancel',
      cssClass: 'btn-cancle',
      onClick: () => this.onCancel(),
    };
  }

  loadServiceTypes(): void {
    this.servicePartnerService.getServiceTypes().subscribe({
      next: (res) => {
        this.serviceTypes = res.data?.records || [];
        this.applyingConfig = {
          ...this.applyingConfig,
          options: this.serviceTypes.map((st) => ({
            label: st.serviceName,
            value: st.id,
          })),
        };
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error(err?.error?.message);
      },
    });
  }

  loadLanguages(): void {
    this.servicePartnerService.getLanguages().subscribe({
      next: (res) => {
        this.languages = res.data || [];
        this.languageConfig = {
          ...this.languageConfig,
          options: this.languages.map((l) => ({
            label: l.name,
            value: l.id,
          })),
        };
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error(err?.error?.message);
      },
    });
  }

  loadCategoriesByServiceType(serviceTypeId: number): void {
    this.servicePartnerService
      .getCategoriesByServiceType(serviceTypeId)
      .subscribe({
        next: (res) => {
          this.categories = res.data?.records || [];
          this.filteredCategories = [...this.categories];
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error(err?.error?.message);
        },
      });
  }

  loadSubCategoriesForSkill(categoryId: number): void {
    this.servicePartnerService
      .getSubCategoriesByCategory(categoryId)
      .subscribe({
        next: (res) => {
          const newSubs = res.data?.records || [];
          newSubs.forEach((sub) => {
            if (!this.subCategories.find((s) => s.id === sub.id))
              this.subCategories.push(sub);
          });
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error(err?.error?.message);
        },
      });
  }

  private resetSkillsAndServices(): void {
    this.categories = [];
    this.filteredCategories = [];
    this.subCategories = [];
    this.selectedSkillIds = [];
    this.selectedServiceIds = [];
    this.skillSearchText = '';
  }

  onSkillInputFocus(): void {
    this.filteredCategories = [...this.categories];
    this.showSkillDropdown = true;
  }

  onSkillSearch(): void {
    const s = this.skillSearchText.toLowerCase().trim();
    this.filteredCategories =
      s === ''
        ? [...this.categories]
        : this.categories.filter((c) =>
            c.categoryName.toLowerCase().includes(s),
          );
    this.showSkillDropdown = true;
  }

  selectSkillFromDropdown(cat: Category): void {
    const idx = this.selectedSkillIds.indexOf(cat.id);

    if (idx === -1) {
      this.selectedSkillIds.push(cat.id);
      this.loadSubCategoriesForSkill(cat.id);
    } else {
      this.selectedSkillIds.splice(idx, 1);

      this.subCategories = this.subCategories.filter(
        (s) => s.categoryId !== cat.id,
      );

      this.selectedServiceIds = this.selectedServiceIds.filter((sid) =>
        this.subCategories.some((s) => s.id === sid),
      );
    }
    setTimeout(() => {
      this.skillSearchText = '';
      this.filteredCategories = [...this.categories];
      this.showSkillDropdown = false;
    }, 0);
  }

  onSkillToggle(id: number): void {
    const idx = this.selectedSkillIds.indexOf(id);
    if (idx === -1) {
      this.selectedSkillIds.push(id);
      this.loadSubCategoriesForSkill(id);
    } else {
      this.selectedSkillIds.splice(idx, 1);
      this.subCategories = this.subCategories.filter(
        (s) => s.categoryId !== id,
      );
      this.selectedServiceIds = this.selectedServiceIds.filter((sid) =>
        this.subCategories.some((s) => s.id === sid),
      );
    }
  }

  getCategoryName(id: number): string {
    return this.categories.find((c) => c.id === id)?.categoryName || '';
  }

  isSkillSelected(id: number): boolean {
    return this.selectedSkillIds.includes(id);
  }

  toggleService(id: number): void {
    const idx = this.selectedServiceIds.indexOf(id);
    if (idx === -1) {
      this.selectedServiceIds.push(id);
    } else {
      this.selectedServiceIds.splice(idx, 1);
    }
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServiceIds.includes(id);
  }

  createEducationGroup(): FormGroup {
    return this.fb.group({
      schoolCollege: ['', [Validators.required, AppValidators.schoolCollege]],
      passingYear: [
        '',
        [
          Validators.required,
          AppValidators.passingYear,
          this.passingYearAfterDobValidator(),
        ],
      ],
      marks: [null, AppValidators.marks],
    });
  }
  passingYearAfterDobValidator() {
    return (
      control: import('@angular/forms').AbstractControl,
    ): import('@angular/forms').ValidationErrors | null => {
      if (!control.value) return null;
      const dob = this.form?.get('dateOfBirth')?.value as string;
      if (!dob || !/^\d{2}-\d{2}-\d{4}$/.test(dob)) return null;
      const dobYear = parseInt(dob.split('-')[2], 10);
      const year = Number(control.value);
      if (isNaN(year) || String(control.value).length !== 4) return null;
      return year < dobYear ? { yearBeforeDob: true } : null;
    };
  }

  onlyDigits(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'End',
      'Home',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];
    if (allowedKeys.indexOf(event.key) !== -1) {
      return;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  validateMarks(index: number): void {
    const control = this.educations.at(index).get('marks');
    if (control) {
      const value = control.value;
      const numValue = Number(value);

      if (numValue > 100) {
        control.setValue('');
        control.setErrors({ invalidMarks: true });
        control.markAsTouched();
      }
    }
  }
  get educations(): FormArray {
    return this.form.get('educations') as FormArray;
  }

  addEducation(): void {
    this.educations.push(this.createEducationGroup());
  }

  removeEducation(i: number): void {
    if (this.educations.length > 1) this.educations.removeAt(i);
  }

  createExperienceGroup(): FormGroup {
    const group = this.fb.group({
      companyName: ['', [Validators.required, AppValidators.companyName]],
      role: ['', [Validators.required, AppValidators.role]],
      fromDate: ['', [Validators.required, AppValidators.date]],
      toDate: [null, [AppValidators.date, AppValidators.toDateAfterFromDate]],
    });

    group.get('fromDate')!.valueChanges.subscribe(() => {
      group.get('toDate')!.updateValueAndValidity({ emitEvent: false });
    });

    return group;
  }

  get experiences(): FormArray {
    return this.form.get('experiences') as FormArray;
  }

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(i: number): void {
    if (this.experiences.length > 1) this.experiences.removeAt(i);
  }

  createLanguageGroup(): FormGroup {
    return this.fb.group({
      languageId: ['', Validators.required],
      proficiency: ['', Validators.required],
    });
  }

  get languages_array(): FormArray {
    return this.form.get('languages') as FormArray;
  }

  addLanguage(): void {
    this.languages_array.push(this.createLanguageGroup());
  }

  getLanguageConfig(index: number): DropdownInputConfig {
    return {
      ...this.languageConfig,
      options: this.getAvailableLanguages(index),
    };
  }

  removeLanguage(i: number): void {
    if (this.languages_array.length > 1) this.languages_array.removeAt(i);
  }

  getAvailableLanguages(index: number) {
    const selectedIds = this.languages_array.controls
      .map((ctrl, i) => (i !== index ? ctrl.get('languageId')?.value : null))
      .filter((v) => v);

    return this.languages
      .filter((lang) => !selectedIds.includes(lang.id))
      .map((l) => ({
        label: l.name,
        value: l.id,
      }));
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.profileImageFile = file;
    this.profileImageName = null;
    if (this.profileImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.profileImageUrl);
    }
    this.profileImageUrl = URL.createObjectURL(file);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(e: DragEvent): void {
    (e.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    this.pendingAttachmentFiles.push({ file, fileName: file.name });
  }

  onAttachmentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.pendingAttachmentFiles.push({ file, fileName: file.name });
    input.value = '';
  }

  private toAttachmentRequest(
    data: UploadAttachmentResponse,
    documentLabel: string,
  ): AttachmentRequest {
    return {
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSizeKb: data.fileSizeKb,
      documentLabel,
    };
  }

  removeAttachment(i: number): void {
    if (i < this.pendingAttachmentFiles.length) {
      this.pendingAttachmentFiles.splice(i, 1);
    } else {
      this.attachments.splice(i - this.pendingAttachmentFiles.length, 1);
    }
  }

  get allAttachments(): { fileName: string }[] {
    return [
      ...this.pendingAttachmentFiles.map((p) => ({ fileName: p.fileName })),
      ...this.attachments.map((a) => ({ fileName: a.fileName })),
    ];
  }

  onSubmit(): void {
    this.formSubmitted = true;

    const savedSkillIds = [...this.selectedSkillIds];
    const savedServiceIds = [...this.selectedServiceIds];
    const savedCategories = [...this.categories];
    const savedSubCategories = [...this.subCategories];

    this.form.markAllAsTouched();
    this.triggerValidation(this.form);

    this.selectedSkillIds = savedSkillIds;
    this.selectedServiceIds = savedServiceIds;
    this.categories = savedCategories;
    this.subCategories = savedSubCategories;
    this.filteredCategories = [...savedCategories];

    if (this.form.invalid) {
      this.toastr.warning(
        'Please fill all required fields correctly.',
        'Incomplete Form',
      );
      return;
    }

    if (this.selectedSkillIds.length === 0) {
      this.toastr.warning(
        'Please select at least one skill.',
        'Skills Required',
      );
      return;
    }

    if (this.selectedServiceIds.length === 0) {
      this.toastr.warning(
        'Please select at least one service.',
        'Services Required',
      );
      return;
    }

    if (
      this.pendingAttachmentFiles.length === 0 &&
      this.attachments.length === 0
    ) {
      this.toastr.warning(
        'Please upload at least one document.',
        'Attachments Required',
      );
      return;
    }

    this.isSubmitting = true;

    const submitWithImage = (imageName: string | null) => {
      const payload: ApplyServicePartnerRequest = {
        ...this.form.value,
        dateOfBirth: this.toIso(this.form.get('dateOfBirth')?.value),
        experiences: this.form.value.experiences.map(
          (exp: ExperienceRequest & { fromDate: string; toDate: string }) => ({
            ...exp,
            fromDate: this.toIso(exp.fromDate),
            toDate: this.toIso(exp.toDate) ?? null,
          }),
        ),
        profileImageUrl: imageName,
        skillCategoryIds: this.selectedSkillIds,
        serviceSubCategoryIds: this.selectedServiceIds,
        attachments: this.attachments,
      };

      this.servicePartnerService.apply(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (this.profileImageUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(this.profileImageUrl);
          }
          this.toastr.success(res.message);
          this.router.navigate([
            ROUTES.SERVICE_PARTNER.ONBOARDING_SUCCESS
              .ONBOARDING_SUCCESS_ABSOLUTE,
          ]);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.toastr.error(err?.error?.message);
        },
      });
    };

    const uploadAllAttachments = (onDone: () => void) => {
      if (this.pendingAttachmentFiles.length === 0) {
        onDone();
        return;
      }
      let completed = 0;
      let failed = false;
      for (const pending of this.pendingAttachmentFiles) {
        this.servicePartnerService
          .uploadAttachment(pending.file, 'Document')
          .subscribe({
            next: (res) => {
              if (!failed) {
                this.attachments.push(
                  this.toAttachmentRequest(res.data, 'Document'),
                );
                completed++;
                if (completed === this.pendingAttachmentFiles.length) {
                  this.pendingAttachmentFiles = [];
                  onDone();
                }
              }
            },
            error: (err: HttpErrorResponse) => {
              if (!failed) {
                failed = true;
                this.isSubmitting = false;
                this.toastr.error(
                  err?.error?.message || 'Failed to upload attachment.',
                );
              }
            },
          });
      }
    };

    const uploadImageAndApply = () => {
      if (this.profileImageFile) {
        this.servicePartnerService
          .uploadProfileImage(this.profileImageFile)
          .subscribe({
            next: (res) => {
              submitWithImage(res.data.imageName);
            },
            error: (err: HttpErrorResponse) => {
              this.isSubmitting = false;
              this.toastr.error(
                err?.error?.message || 'Failed to upload profile image.',
              );
            },
          });
      } else {
        submitWithImage(null);
      }
    };

    uploadAllAttachments(() => uploadImageAndApply());
  }

  private triggerValidation(group: FormGroup): void {
    Object.values(group.controls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity({ emitEvent: false });
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.triggerValidation(control as FormGroup);
      }
    });
  }

  navigateTohome(): void {
    this.router.navigate([ROUTES.CUSTOMER.HOME.HOME]);
  }

  onCancel(): void {
    this.router.navigate([ROUTES.CUSTOMER.HOME.HOME]);
  }

  private toIso(raw: string): string | null {
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw;
    const [d, m, y] = raw.split(/[-]/);
    return y && m && d ? `${y}-${m}-${d}` : null;
  }
}
