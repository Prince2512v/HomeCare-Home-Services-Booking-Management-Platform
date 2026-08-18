import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonInputConfig, Button, Name, NameFieldConfig } from '@common';
import { ToastrService } from 'ngx-toastr';
import { AppValidators } from '@Validators';
import { RequiredFieldDirective } from '@directives';

@Component({
  selector: 'app-addcategory-model',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Button, Name, RequiredFieldDirective],
  templateUrl: './addcategory-model.html',
  styleUrl: './addcategory-model.css',
})
export class AddcategoryModel implements OnInit {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() type: 'Category' | 'Sub Category' = 'Category';
  @Input() existingNames: string[] = [];

  @Output() modalClose = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<{ name: string; tempId: string }>();

  formGroup!: FormGroup;
  nameConfig!: NameFieldConfig;

  cancelConfig: ButtonInputConfig = {
    variant: 'close',
    onClick: () => this.closeModal()
  };

  saveConfig: ButtonInputConfig = {
    variant: 'save',
    onClick: () => this.save()
  };

  constructor(private fb: FormBuilder, private toastr: ToastrService) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, AppValidators.noWhitespace, AppValidators.name]]
    });

    this.nameConfig = {
      label: this.type,
      placeholder: this.type,
      formControlName: 'name'
    };
  }

  save() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const name = this.formGroup.value.name.trim();
    const nameLower = name.toLowerCase();
    const isDuplicate = this.existingNames.some(
      (n) => n.trim().toLowerCase() === nameLower
    );

    if (isDuplicate) {
      if (this.type === 'Sub Category') {
        this.toastr.warning(`Sub-category "${name}" already exists under this category. Please use a unique name.`);
      } else {
        this.toastr.warning(`Category "${name}" already exists. Please use a unique name.`);
      }
      return;
    }

    const tempId = this.type === 'Category' ? ('temp_' + Date.now()) : ('temp_sub_' + Date.now());

    this.submitForm.emit({ name, tempId });
    this.closeModal();
  }

  closeModal() {
    this.formGroup.reset();
    this.modalClose.emit();
  }
}
