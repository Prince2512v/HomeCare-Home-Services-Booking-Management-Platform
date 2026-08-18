import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  NameInputConfig,
  MobileNumberConfig,
  EmailInputConfig,
  AddressConfig,
  ButtonInputConfig,
  Name,
  MobileNumber,
  Email,
  Address,
  Button,
} from '@common';
import { AppValidators } from '@Validators';
import { ApiService } from '@services';
import { API_ROUTES } from '@constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, Name, MobileNumber, Email, Address, Button],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs implements OnInit {
  @Input() phone: string = '+91 96014 21472';
  @Input() email: string = 'hr@tatvasoft.com';
  @Input() addressLine1: string = 'TatvaSoft House, Rajpath Road,';
  @Input() addressLine2: string = 'Off S G Road, Ahmedabad, Gujarat -380054';

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);

  contactForm!: FormGroup;
  isSubmitting = false;

  firstNameConfig!: NameInputConfig;
  lastNameConfig!: NameInputConfig;
  mobileConfig!: MobileNumberConfig;
  emailConfig!: EmailInputConfig;
  descriptionConfig!: AddressConfig;
  sendMessageConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.initForm();
    this.initFieldConfigs();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, AppValidators.name]],
      lastName: ['', [Validators.required, AppValidators.name]],
      mobile: ['', [Validators.required, AppValidators.phone]],
      email: ['', [Validators.required, AppValidators.email]],
      description: ['', [Validators.required]],
    });
  }

  private initFieldConfigs(): void {
    this.firstNameConfig = {
      formControlName: 'firstName',
      placeholder: 'First Name',
      floating: true,
      onChange: (event) => this.onNameInput(event, 'firstName'),
      onBlur: () => this.onNameBlur('firstName'),
    };

    this.lastNameConfig = {
      formControlName: 'lastName',
      placeholder: 'Last Name',
      floating: true,
      onChange: (event) => this.onNameInput(event, 'lastName'),
      onBlur: () => this.onNameBlur('lastName'),
    };

    this.mobileConfig = {
      formControlName: 'mobile',
      placeholder: 'Mobile Number',
      maxLength: 15,
      floating: true,
      onChange: (event) => this.onMobileInput(event),
      onBlur: () => this.onMobileBlur(),
    };

    this.emailConfig = {
      formControlName: 'email',
      placeholder: 'Email',
      floating: true,
      onChange: (event) => this.onEmailInput(event),
      onBlur: () => this.onEmailBlur(),
    };

    this.descriptionConfig = {
      formControlName: 'description',
      placeholder: 'Description',
      floating: true,
      onChange: (event) => this.onDescriptionInput(event),
      onBlur: () => this.onDescriptionBlur(),
    };

    this.sendMessageConfig = {
      text: 'Send Message',
      cssClass: 'btn-apply submit',
      onClick: () => this.onSubmit(),
    };
  }

  onNameInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    this.contactForm
      .get(controlName)
      ?.setValue(input.value, { emitEvent: false });
  }

  onNameBlur(controlName: string): void {
    this.contactForm.get(controlName)?.markAsTouched();
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contactForm
      .get(this.mobileConfig.formControlName)
      ?.setValue(input.value.trim(), { emitEvent: false });
  }

  onMobileBlur(): void {
    this.contactForm.get(this.mobileConfig.formControlName)?.markAsTouched();
  }

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contactForm
      .get(this.emailConfig.formControlName)
      ?.setValue(input.value.trim(), { emitEvent: false });
  }

  onEmailBlur(): void {
    this.contactForm.get(this.emailConfig.formControlName)?.markAsTouched();
  }

  onDescriptionInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.contactForm
      .get(this.descriptionConfig.formControlName)
      ?.setValue(input.value, { emitEvent: false });
  }

  onDescriptionBlur(): void {
    this.contactForm
      .get(this.descriptionConfig.formControlName)
      ?.markAsTouched();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      const payload = {
        firstName: this.contactForm.value.firstName,
        lastName: this.contactForm.value.lastName,
        contactNumber: this.contactForm.value.mobile,
        email: this.contactForm.value.email,
        description: this.contactForm.value.description,
      };

      this.apiService
        .post(API_ROUTES.SUPPORT_TICKETS.SUBMIT, payload)
        .subscribe({
          next: (res: any) => {
            this.isSubmitting = false;
            const message = res?.message;
            this.toastr.success(message, 'Success');
            this.contactForm.reset();
          },
          error: (err: any) => {
            this.isSubmitting = false;
            const message = err?.error?.message;
            this.toastr.error(message, 'Error');
          },
        });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}