import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button, ButtonInputConfig } from '@common';
import { CheckoutResx } from '../../Models/checkout.models';

@Component({
  selector: 'app-select-date',
  imports: [CommonModule, Button],
  templateUrl: './select-date.html',
  styleUrl: './select-date.css',
})
export class SelectDate implements OnInit {
  @Output() dateSelected = new EventEmitter<string>();

  readonly resx = CheckoutResx;
  selectedDate: Date | null = null;

  dates: Date[] = [];

  private readonly today = new Date();

  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {
    this.dates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(this.today);
      d.setDate(this.today.getDate() + i);
      return d;
    });
  }

  getDateBtnConfig(date: Date): ButtonInputConfig {
    return {
      text: `${date.getDate()} ${this.getMonthName(date)}`,
      cssClass: `
        sd-date-pill
        ${this.isSelected(date) ? 'sd-date-pill--active' : ''}
      `,
      onClick: () => this.selectDate(date),
    };
  }

  isToday(date: Date): boolean {
    return (
      date.getFullYear() === this.today.getFullYear() &&
      date.getMonth() === this.today.getMonth() &&
      date.getDate() === this.today.getDate()
    );
  }

  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return (
      date.getFullYear() === this.selectedDate.getFullYear() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getDate() === this.selectedDate.getDate()
    );
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.dateSelected.emit(this.toIso(date));
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short' });
  }

  private toIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}