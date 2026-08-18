import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Button, ButtonInputConfig, Name, NameFieldConfig } from '@common';
import { AppValidators } from '@Validators';
import { ToastrService } from 'ngx-toastr';
import { MasterDataService } from '@masterDataServices';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-service-type-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Name, Button],
  templateUrl: './service-type-modal.html',
  styleUrls: ['./service-type-modal.css'],
})
export class ServiceTypeModal implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() title = 'Service Type';

  @Input() editId: number | null = null;

  @Output() modalClose = new EventEmitter<void>();
  @Output() modalSave = new EventEmitter<void>();

  serviceTypeForm!: FormGroup;
  nameConfig!: NameFieldConfig;

  cancelConfig: ButtonInputConfig = { variant: 'close', onClick: () => this.closeModal() };
  saveConfig: ButtonInputConfig = { variant: 'save', onClick: () => this.handleSave() };

  selectedFile: File | null = null;
  uploadedFileName = '';
  isLoading = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private masterdataservice: MasterDataService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setNameConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editId'] && this.editId && this.serviceTypeForm) {
      this.loadServiceTypeById(this.editId);
    }

    if (changes['isOpen'] && this.isOpen && !this.editId && this.serviceTypeForm) {
      this.serviceTypeForm.reset();
      this.selectedFile = null;
      this.uploadedFileName = '';
    }
  }

  private loadServiceTypeById(id: number): void {
    this.masterdataservice.getServiceTypeById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res?.data;
          if (data) {
            this.serviceTypeForm.setValue({
              serviceName: data.serviceName || '',
              icon: null,
            });
            this.selectedFile = null;
            this.uploadedFileName = '';
          }
        },
        error: () => {
          this.toastr.error('Failed to load service type details');
        },
      });
  }

  private initializeForm(): void {
    this.serviceTypeForm = this.fb.group({
      serviceName: ['', [Validators.required, AppValidators.name]],
      icon: [null],
    });
  }

  private setNameConfig(): void {
    this.nameConfig = {
      label: 'Service Type',
      placeholder: 'Service Type',
      formControlName: 'serviceName',
    };
  }

  get control(): AbstractControl | null {
    return this.serviceTypeForm.get('serviceName');
  }

  get errors(): ValidationErrors | null {
    return this.control?.errors || null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadedFileName = file.name;
      this.serviceTypeForm.patchValue({ icon: file });
    }
  }

  handleSave(): void {
    this.serviceTypeForm.markAllAsTouched();

    if (this.serviceTypeForm.invalid) {
      const iconErrors = this.serviceTypeForm.get('icon')?.errors;
      if (iconErrors?.['invalidImageType']) {
        this.toastr.warning('Only PNG, JPG, JPEG, or SVG images are allowed');
      } else if (iconErrors?.['imageTooLarge']) {
        this.toastr.warning('Image size must not exceed 5MB');
      } else {
        this.toastr.warning('Please enter a valid service name');
      }
      return;
    }

    const serviceName: string = this.serviceTypeForm.value.serviceName;
    const formData = new FormData();
    formData.append('ServiceName', serviceName);
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile, this.selectedFile.name);
    }

    if (this.editId) {
      formData.append('Id', this.editId.toString());
    }

    const api$ = this.editId
      ? this.masterdataservice.updateServiceType(this.editId, formData )
      : this.masterdataservice.createServiceType(formData);

    this.setLoading(true);

    api$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.setLoading(false);
        this.toastr.success(res.message);
        this.modalSave.emit();
        this.closeModal();
      },
      error: (err) => {
        this.setLoading(false);
        this.toastr.error(err?.error?.message || 'Something went wrong');
      },
    });
  }

  private setLoading(state: boolean): void {
    this.isLoading = state;
    this.saveConfig = { ...this.saveConfig, isLoading: state };
  }

  closeModal(): void {
    this.serviceTypeForm.reset();
    this.selectedFile = null;
    this.uploadedFileName = '';
    this.modalClose.emit();
  }
}