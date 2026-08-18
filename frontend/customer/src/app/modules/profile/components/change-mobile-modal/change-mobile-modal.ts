import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModal, MobileNumber, MobileNumberConfig, Button, ButtonInputConfig } from '@common';
import { ProfileService } from '@profileservices';
import { AppValidators } from '@Validators';

@Component({
  selector: 'app-change-mobile-modal',
  imports: [CommonModule, ReactiveFormsModule, CommonModal, MobileNumber, Button],
  templateUrl: './change-mobile-modal.html',
  styleUrl: './change-mobile-modal.css',
})
export class ChangeMobileModal implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);

  @Input() currentMobile = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  form!: FormGroup;
  mobileConfig!: MobileNumberConfig;
  isLoading = false;

  get saveBtnConfig(): ButtonInputConfig {
    return {
      text: 'Save',
      cssClass: 'btn-save',
      isLoading: this.isLoading,
      disabled: this.isLoading,
      onClick: () => this.save(),
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setFormInputConfig();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      mobile: ['', [Validators.required, AppValidators.phone]],
    });
  }

  private setFormInputConfig(): void {
    this.mobileConfig = {
      formControlName: 'mobile',
      placeholder: 'New Mobile Number',
      floating: true,
    };
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const newMobile = this.form.value.mobile;
    this.isLoading = true;

    this.profileService.updatePhone(newMobile).subscribe({
      next: () => {
        this.isLoading = false;
        this.saved.emit(newMobile);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err?.error?.message);
      },
    });
  }
}