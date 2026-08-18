import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonInputConfig, Name, NameFieldConfig, MobileNumber, MobileNumberConfig, Email, EmailInputConfig } from '@common';
import { AppValidators } from '@Validators';
import { CreateCustomerRequestModel } from '@customerManagementModels';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, Name, MobileNumber, Email],
  templateUrl: './customer-modal.html',
  styleUrl: './customer-modal.css',
})
export class CustomerModal implements OnInit {
  @Output() modalClose = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateCustomerRequestModel>();

  customerForm!: FormGroup;

  nameConfig!: NameFieldConfig;
  mobileConfig!: MobileNumberConfig;
  emailConfig!: EmailInputConfig;
  cancelConfig!: ButtonInputConfig;
  saveConfig!: ButtonInputConfig;

  constructor(private fb: FormBuilder) {}

  get f() {
    return this.customerForm.controls;
  }

  ngOnInit(): void {
    this.initForm();
    this.initConfigs();
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, AppValidators.noWhitespace]],
      mobileNumber: ['', [Validators.required, AppValidators.phone]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private initConfigs(): void {
    this.nameConfig = {
      label: 'Name',
      placeholder: 'Name',
      formControlName: 'name',
    };

    this.mobileConfig = {
      formControlName: 'mobileNumber',
      placeholder: 'Mobile Number',
      floating: true,
    };

    this.emailConfig = {
      placeholder: 'Email',
      formControlName: 'email',
      floating: true,
    };

    this.cancelConfig = {
      variant: 'close',
      text: 'Cancel',
      onClick: () => this.closeModal(),
    };

    this.saveConfig = {
      variant: 'save',
      text: 'Save',
      onClick: () => this.handleSave(),
    };
  }

  handleSave(): void {
    this.customerForm.markAllAsTouched();
    if (this.customerForm.invalid) return;

    const createData: CreateCustomerRequestModel = {
      name: this.f['name']?.value?.trim(),
      mobileNumber: this.f['mobileNumber']?.value?.trim(),
      email: this.f['email']?.value?.trim(),
    };

    this.save.emit(createData);
  }

  closeModal(): void {
    this.customerForm.reset();
    this.modalClose.emit();
  }
}