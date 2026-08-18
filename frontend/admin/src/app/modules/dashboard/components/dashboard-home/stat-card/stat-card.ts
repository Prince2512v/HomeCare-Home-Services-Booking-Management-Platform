import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardModel } from '@dashboardModels';

export interface StatCardConfig {
  label: string;
  iconSrc: string;
  formatFn: (value: number) => string;
  badgeLabel?: string;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input() data!: MetricCardModel;
  @Input() config!: StatCardConfig;

  get displayValue(): string {
    return this.config.formatFn(this.data.currentValue);
  }
  get pctClass(): string {
    return this.data.isIncrease ? 'pct-up' : 'pct-down';
  }
  get pctSign(): string {
    return this.data.isIncrease ? '+' : '';
  }
}