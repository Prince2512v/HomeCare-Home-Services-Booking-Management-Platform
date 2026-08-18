import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonInputConfig } from '@common';
import { Button } from '../button/button';
import { ConfirmationModelConfig } from './confirmation-model.config.js';

@Component({
  selector: 'app-confirmation-model',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './confirmation-model.html',
  styleUrl: './confirmation-model.css',
})
export class ConfirmationModel {
  @Input() visible = false;

  @Input() config: ConfirmationModelConfig = {
    title: '',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Delete',
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  cancelConfig: ButtonInputConfig = { variant: 'close', onClick: () => this.onCancel() };
  confirmationConfig: ButtonInputConfig = { variant: 'save', onClick: () => this.onSave() };

  onSave(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }
}
