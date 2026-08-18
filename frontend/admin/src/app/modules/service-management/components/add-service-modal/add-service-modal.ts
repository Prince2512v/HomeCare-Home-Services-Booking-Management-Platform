import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Button,
  ButtonInputConfig,
  Description,
  DescriptionFieldConfig,
  Name,
  NameFieldConfig,
  NumberInput,
  NumberInputConfig,
} from '@common';
import { AppValidators } from '@Validators';
import { ToastrService } from 'ngx-toastr';
import { RequiredFieldDirective } from '@directives';
import { GetSubCategoryResponseModel } from '../../models/service-management.model';
import { ServiceManagementService } from '../../services/service-management.service';

@Component({
  selector: 'app-add-service-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    Name,
    RequiredFieldDirective,
    NumberInput,
    Description,
  ],
  templateUrl: './add-service-modal.html',
  styleUrl: './add-service-modal.css',
})
export class AddServiceModal implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() title = 'Service';
  @Input() serviceId!: number;
  @Input() subCategories: GetSubCategoryResponseModel[] = [];
  @Input() editId: number | null = null;
  @Input() existingServices: { name: string; subCategoryId: number; id?: number }[] = [];

  @Output() modalClose = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private svc = inject(ServiceManagementService);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  servicesForm!: FormGroup;
  nameConfig!: NameFieldConfig;
  durationConfig: NumberInputConfig = {
    formControlName: 'duration',
    placeholder: 'Duration',
    suffixIcon: 'assets/icons/Clock.svg',
    min: 1,
    max: 999,
  };
  priceConfig: NumberInputConfig = {
    formControlName: 'price',
    placeholder: 'Price',
    suffix: '$',
    min: 0.01,
  };
  commissionConfig: NumberInputConfig = {
    formControlName: 'commission',
    placeholder: 'Commission',
    suffix: '%',
    min: 1,
    max: 99,
  };
  subCategoryId: number | null = null;

  isAvailable: boolean = true;

  get name(): string {
    return this.servicesForm?.get('name')?.value ?? '';
  }

  images: File[] = [];
  imagePreviews: string[] = [];

  existingImages: { id: number; imageUrl: string }[] = [];
  deleteImageIds: number[] = [];

  showInclusions = false;
  inclusionInput = '';
  inclusionItems: string[] = [];

  showExclusions = false;
  exclusionInput = '';
  exclusionItems: string[] = [];

  isLoading = false;

  private originalSnapshot: {
    name: string;
    description: string | null;
    subCategoryId: number | null;
    duration: number | null;
    price: number | null;
    commission: number | null;
    isAvailable: boolean;
    inclusionItems: string[];
    exclusionItems: string[];
    existingImageIds: number[];
  } | null = null;

  get isEditMode(): boolean {
    return !!this.editId;
  }
  descriptionConfig: DescriptionFieldConfig = {
    placeholder: 'Description',
    formControlName: 'description',
    rows: 2,
  };

  cancelConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Cancel',
    onClick: () => this.closeModal(),
  };
  saveConfig: ButtonInputConfig = {
    variant: 'save',
    text: 'Save',
    onClick: () => this.handleSave(),
  };

  ngOnInit(): void {
    this.initializeForm();
    this.setFormInputConfig();
    this.handleCommissionChanges();
  }

  private initializeForm(): void {
    this.servicesForm = this.fb.group({
      name: ['', [Validators.required, AppValidators.name]],
      description: [null],
      duration: [null, [Validators.required, Validators.min(1), Validators.max(999)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      commission: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
    });
  }

  private setFormInputConfig(): void {
    this.nameConfig = {
      label: 'Service Name',
      placeholder: 'Service Name',
      formControlName: 'name',
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    const editIdChanged = changes['editId'] && this.editId;
    const modalJustOpened = changes['isOpen'] && this.isOpen;

    if (this.editId && (editIdChanged || modalJustOpened)) {
      this.reset();
      this.loadForEdit(this.editId);
      return;
    }

    if (changes['isOpen'] && this.isOpen && !this.editId) {
      this.reset();
    }
  }
  private handleCommissionChanges(): void {
    this.servicesForm
      .get('commission')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value > 99) {
          this.servicesForm.get('commission')?.setValue(0, { emitEvent: false });
        }
      });
  }
  private loadForEdit(id: number): void {
    this.setLoading(true);
    this.svc
      .getServiceById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res?.data;
          if (!data) {
            this.setLoading(false);
            return;
          }

          this.servicesForm.patchValue({
            name: data.name ?? '',
            description: data.description ?? null,
          });
          this.subCategoryId = data.subCategoryId ?? null;
          this.servicesForm.patchValue({
            duration: data.duration,
            price: data.price,
            commission: data.commission,
          });
          this.isAvailable = data.isAvailable;

          this.existingImages = data.images ?? [];
          this.deleteImageIds = [];
          this.images = [];
          this.imagePreviews = [];

          this.inclusionItems = (data.inclusionItems ?? []).map((i: any) => i.item).filter(Boolean);
          this.exclusionItems = (data.exclusionItems ?? []).map((i: any) => i.item).filter(Boolean);
          this.showInclusions = this.inclusionItems.length > 0;
          this.showExclusions = this.exclusionItems.length > 0;
          this.inclusionInput = '';
          this.exclusionInput = '';

          this.originalSnapshot = {
            name: data.name ?? '',
            description: data.description ?? null,
            subCategoryId: data.subCategoryId ?? null,
            duration: data.duration,
            price: data.price,
            commission: data.commission,
            isAvailable: data.isAvailable,
            inclusionItems: [...this.inclusionItems],
            exclusionItems: [...this.exclusionItems],
            existingImageIds: (data.images ?? []).map((img: any) => img.id),
          };

          this.setLoading(false);
        },
        error: (err: any) => {
          this.setLoading(false);
          this.toastr.error(err?.error?.message);
        },
      });
  }

  onImageSelect(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    files.forEach((file) => {
      this.images.push(file);
      const reader = new FileReader();
      reader.onload = (ev) => this.imagePreviews.push(ev.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeNewImage(index: number): void {
    this.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  markExistingForDelete(id: number): void {
    if (!this.deleteImageIds.includes(id)) this.deleteImageIds.push(id);
    this.existingImages = this.existingImages.filter((i) => i.id !== id);
  }

  addInclusion(): void {
    const val = this.inclusionInput.trim();
    if (val && !this.inclusionItems.includes(val)) {
      this.inclusionItems.push(val);
      this.inclusionInput = '';
    }
  }
  removeInclusion(i: number): void {
    this.inclusionItems.splice(i, 1);
  }

  addExclusion(): void {
    const val = this.exclusionInput.trim();
    if (val && !this.exclusionItems.includes(val)) {
      this.exclusionItems.push(val);
      this.exclusionInput = '';
    }
  }
  removeExclusion(i: number): void {
    this.exclusionItems.splice(i, 1);
  }

  handleSave(): void {
    if (this.isEditMode) {
      const hasInvalidDirtyFields = Object.keys(this.servicesForm.controls).some((key) => {
        const control = this.servicesForm.get(key);
        return control?.invalid && control?.dirty;
      });

      if (hasInvalidDirtyFields || !this.subCategoryId) {
        this.toastr.warning('Please fill all required fields.');
        return;
      }
    } else {
      this.servicesForm.markAllAsTouched();

      if (this.servicesForm.invalid || !this.subCategoryId) {
        this.toastr.warning('Please fill all  fields.');
        return;
      }
    }

    const nameVal = this.name.trim();

    const isDuplicate = this.existingServices.some(
      (s) =>
        s.name.trim().toLowerCase() === nameVal.toLowerCase() &&
        s.subCategoryId === this.subCategoryId &&
        s.id !== (this.editId ?? undefined)
    );
    if (isDuplicate) {
      const subName =
        this.subCategories.find((s) => s.id === this.subCategoryId)?.subCategoryName ??
        'selected sub category';
      this.toastr.warning(
        `A service named "${nameVal}" already exists under "${subName}". Please use a unique name.`
      );
      return;
    }

    if (this.isEditMode && !this.hasChanges(nameVal)) {
      this.closeModal();
      return;
    }

    const fd = new FormData();
    fd.append('Name', nameVal);
    fd.append('SubCategoryId', String(this.subCategoryId));
    fd.append('Duration', String(this.servicesForm.get('duration')?.value));
    fd.append('Price', String(this.servicesForm.get('price')?.value));
    fd.append('Commission', String(this.servicesForm.get('commission')?.value));
    fd.append('IsAvailable', String(this.isAvailable));

    const descVal = this.servicesForm.get('description')?.value;
    if (descVal !== null && descVal.trim() !== '') {
      fd.append('Description', descVal.trim());
    }

    this.inclusionItems.forEach((i) => fd.append('InclusionItems', i));
    this.exclusionItems.forEach((i) => fd.append('ExclusionItems', i));

    const api$ = this.editId ? this.buildUpdateRequest(fd) : this.buildCreateRequest(fd);

    this.setLoading(true);

    api$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.setLoading(false);
        this.toastr.success(res?.message);
        this.save.emit();
        this.closeModal();
      },
      error: (err: any) => {
        this.setLoading(false);
        this.toastr.error(err?.error?.message);
      },
    });
  }

  private hasChanges(nameVal: string): boolean {
    if (!this.originalSnapshot) return true;

    const s = this.originalSnapshot;
    if (nameVal !== s.name) return true;
    if ((this.servicesForm.get('description')?.value ?? null) !== s.description) return true;
    if (this.subCategoryId !== s.subCategoryId) return true;
    if (this.servicesForm.get('duration')?.value !== s.duration) return true;
    if (this.servicesForm.get('price')?.value !== s.price) return true;
    if (this.servicesForm.get('commission')?.value !== s.commission) return true;
    if (this.isAvailable !== s.isAvailable) return true;
    if (this.images.length > 0) return true;
    if (this.deleteImageIds.length > 0) return true;
    if (this.inclusionItems.length !== s.inclusionItems.length) return true;
    if (this.inclusionItems.some((v, i) => v !== s.inclusionItems[i])) return true;
    if (this.exclusionItems.length !== s.exclusionItems.length) return true;
    if (this.exclusionItems.some((v, i) => v !== s.exclusionItems[i])) return true;

    return false;
  }

  private buildCreateRequest(fd: FormData) {
    this.images.forEach((f) => fd.append('Images', f));
    return this.svc.createService(fd);
  }

  private buildUpdateRequest(fd: FormData) {
    fd.append('Id', String(this.editId));
    this.images.forEach((f) => fd.append('NewImages', f));
    this.deleteImageIds.forEach((id) => fd.append('DeleteImageIds', String(id)));
    return this.svc.updateService(this.editId!, fd);
  }

  closeModal(): void {
    this.reset();
    this.modalClose.emit();
  }

  private setLoading(state: boolean): void {
    this.isLoading = state;
    this.saveConfig = { ...this.saveConfig, isLoading: state };
  }

  private reset(): void {
    this.servicesForm?.reset();
    this.subCategoryId = null;
    this.isAvailable = true;
    this.images = [];
    this.imagePreviews = [];
    this.existingImages = [];
    this.deleteImageIds = [];
    this.showInclusions = false;
    this.inclusionInput = '';
    this.inclusionItems = [];
    this.showExclusions = false;
    this.exclusionInput = '';
    this.exclusionItems = [];
    this.isLoading = false;
    this.originalSnapshot = null;
  }
}
