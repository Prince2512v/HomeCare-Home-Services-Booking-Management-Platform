import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-modal',
  imports: [CommonModule],
  templateUrl: './common-modal.html',
  styleUrl: './common-modal.css',
})
export class CommonModal {
  @Input() title = '';
  @Input() maxWidth = '440px';
  @Output() close = new EventEmitter<void>();
}