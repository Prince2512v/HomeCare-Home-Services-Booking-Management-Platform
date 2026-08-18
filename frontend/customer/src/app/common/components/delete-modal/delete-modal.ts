import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constant } from '@constants';
import { CommonModal, Button, ButtonInputConfig } from '@common';
import { DeleteModalConfig } from './delete-modal.config';

const BUTTON_CONSTANT = {
  CANCEL: Constant.CANCEL,
  DELETE: Constant.DELETE,
};

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule, CommonModal, Button],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css',
})
export class DeleteModal {
  @Input() visible = false;

  @Input() config: DeleteModalConfig = {
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this item?',
    cancelText: BUTTON_CONSTANT.CANCEL,
    deleteText: BUTTON_CONSTANT.DELETE,
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  cancelConfig: ButtonInputConfig = {
    text: 'Cancel',
    cssClass: 'btn-cancle',
    onClick: () => this.onCancel(),
  };
  deleteConfig: ButtonInputConfig = {
    text: 'Delete',
    cssClass: 'btn-delete',
    onClick: () => this.onDelete(),
  };

  onDelete(): void {
    this.confirm.emit();
  }
  onCancel(): void {
    this.closed.emit();
  }
}