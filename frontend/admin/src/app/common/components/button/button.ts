import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonInputConfig, BUTTON_VARIANTS } from '@common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
})
export class Button {
  @Input() config!: ButtonInputConfig;

  get variantClass(): string {
      if (this.config?.cssClass) return this.config.cssClass;

    return BUTTON_VARIANTS[this.config?.variant]?.class ?? '';
  }

  get variantText(): string {
    return BUTTON_VARIANTS[this.config?.variant]?.text ?? '';
  }

  get isToggle(): boolean {
    return this.config?.variant === 'toggle';
  }

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
