import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonInputConfig } from '@common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
})
export class Button {
  @Input() config!: ButtonInputConfig;

  handleClick(e: MouseEvent): void {
    if (!this.config.disabled && !this.config.isLoading) {
      this.config?.onClick?.(e);
    }
  }

  handleToggle(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.config?.onToggle?.(checked);
  }
}
