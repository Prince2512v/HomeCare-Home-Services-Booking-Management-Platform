import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import {
  Button,
  ButtonInputConfig,
  Email,
  EmailInputConfig,
  MobileNumber,
  MobileNumberConfig,
  Name,
  NameFieldConfig,
  Password,
  PasswordInputConfig,
} from '@common';
import { AppValidators } from '@Validators';
import {
  GetAdminUserResponseModel,
  CreateAdminUserRequestModel,
  UpdateAdminUserRequestModel,
} from '../../../models';
import { AdminUserService } from '../../../services';

export interface AdminUserSavedEvent {
  action: 'create' | 'edit';
  previousUser: GetAdminUserResponseModel | null;
  formData: Record<string, string>;
}

@Component({
  selector: 'app-admin-users-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, Name, Email, MobileNumber, Password],
  templateUrl: './admin-users-modal.html',
  styleUrl: './admin-users-modal.css',
})
export class AdminUsersModal implements OnInit {
  @Input() user: GetAdminUserResponseModel | null = null;
  @Input() isSuperAdmin = false;

  @Output() modalClose = new EventEmitter<void>();
  @Output() saved = new EventEmitter<AdminUserSavedEvent>();

  form!: FormGroup;
  isSaving = false;
  isLoadingUser = false;
  private originalValues: { name: string; mobileNumber: string; email: string } | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private adminUserService = inject(AdminUserService);
  private toastr = inject(ToastrService);

  nameConfig: NameFieldConfig = {
    label: 'Name',
    placeholder: 'Full Name',
    formControlName: 'name',
  };
  mobileConfig: MobileNumberConfig = {
    placeholder: 'Mobile Number',
    formControlName: 'mobileNumber',
    floating: true,
  };
  emailConfig: EmailInputConfig = {
    placeholder: 'Email Address',
    formControlName: 'email',
    floating: true,
  };
  passwordConfig: PasswordInputConfig = {
    placeholder: 'Password',
    formControlName: 'password',
    floating: true,
  };
  confirmPasswordConfig: PasswordInputConfig = {
    placeholder: 'Confirm Password',
    formControlName: 'confirmPassword',
    floating: true,
  };

  cancelConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Cancel',
    onClick: () => this.close(),
  };
  saveConfig: ButtonInputConfig = {
    variant: 'save',
    text: 'Save',
    onClick: () => this.handleSave(),
  };

  get isEditMode(): boolean {
    return !!this.user;
  }
  get showPasswordInEdit(): boolean {
    return this.isEditMode && this.isSuperAdmin;
  }
  get modalTitle(): string {
    if (!this.isEditMode) return 'Add Admin User';
    return this.isSuperAdmin ? 'Edit User' : 'Edit My Details';
  }
  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.user) this.loadUser(this.user.id);
  }

  private buildForm(): void {
    const base = {
      name: ['', [Validators.required, AppValidators.name]],
      mobileNumber: ['', [Validators.required, AppValidators.phone]],
      email: ['', [Validators.required, AppValidators.email]],
    };

    if (!this.isEditMode) {
      this.form = this.fb.group(
        {
          ...base,
          password: ['', [Validators.required, AppValidators.password]],
          confirmPassword: ['', Validators.required],
        },
        { validators: this.passwordsMatch }
      );
    } else if (this.isSuperAdmin) {
      this.form = this.fb.group(
        { ...base, password: ['', [AppValidators.password]], confirmPassword: [''] },
        { validators: this.passwordsMatch }
      );
    } else {
      this.form = this.fb.group(base);
    }
  }

  private loadUser(id: number): void {
    this.isLoadingUser = true;
    this.form.disable();
    this.adminUserService
      .getAdminUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.form.patchValue({
              name: res.data.name ?? '',
              mobileNumber: res.data.mobileNumber ?? '',
              email: res.data.email ?? '',
            });
            this.originalValues = {
              name: res.data.name ?? '',
              mobileNumber: res.data.mobileNumber ?? '',
              email: res.data.email ?? '',
            };
            this.form.enable();
          }
          this.isLoadingUser = false;
        },
        error: () => {
          this.isLoadingUser = false;
          this.form.enable();
        },
      });
  }

  private passwordsMatch(group: FormGroup): { [key: string]: boolean } | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    if (!pw && !cpw) return null;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  handleSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving) return;

    const name = this.f['name'].value as string;
    const mobileNumber = this.f['mobileNumber'].value as string;
    const email = this.f['email'].value as string;
    const password = (this.f['password']?.value as string) ?? '';
    const confirmPassword = (this.f['confirmPassword']?.value as string) ?? '';

    if (this.isEditMode) {
      const detailsChanged =
        this.originalValues === null ||
        name !== this.originalValues.name ||
        mobileNumber !== this.originalValues.mobileNumber ||
        email !== this.originalValues.email;

      const passwordEntered = this.isSuperAdmin && !!password;

      if (!detailsChanged && !passwordEntered) {
        this.toastr.warning('No changes detected. Please modify at least one field before saving.');
        return;
      }
    }

    this.isSaving = true;
    this.saveConfig = { ...this.saveConfig, isLoading: true };

    const obs = this.isEditMode
      ? this.adminUserService.updateAdminUser(this.user!.id, {
          id: this.user!.id,
          name,
          mobileNumber,
          email,
          isSuperAdmin: this.user?.role === 'Super Admin',
          ...(this.isSuperAdmin && password ? { password, confirmPassword } : {}),
        } as UpdateAdminUserRequestModel)
      : this.adminUserService.createAdminUser({
          name,
          mobileNumber,
          email,
          isSuperAdmin: false,
          password,
          confirmPassword,
        } as CreateAdminUserRequestModel);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.saved.emit({
          action: this.isEditMode ? 'edit' : 'create',
          previousUser: this.user,
          formData: { name, mobileNumber, email },
        });
        this.close();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || err?.error?.errorMessages?.[0]);
        this.isSaving = false;
        this.saveConfig = { ...this.saveConfig, isLoading: false };
      },
    });
  }

  close(): void {
    this.modalClose.emit();
  }
}
