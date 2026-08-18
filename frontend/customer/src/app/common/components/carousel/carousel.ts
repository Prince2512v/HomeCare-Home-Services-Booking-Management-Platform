import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselConfig } from './carousel.config';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
})
export class Carousel implements OnInit {
  @Input() config!: CarouselConfig;

  currentIndex = 0;
  responsiveVisible: number = 6;

  get visibleCount(): number {
    return this.config?.visibleCount ?? 4;
  }
  get gap(): number {
    return this.config?.gap ?? 16;
  }
  get title(): string {
    return this.config?.title ?? '';
  }
  get seeMoreLink(): string {
    return this.config?.seeMoreLink ?? '';
  }
  get totalItems(): number {
    return this.config?.totalItems ?? 0;
  }

  ngOnInit(): void {
    this.updateVisibleCount();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleCount();
    const max = Math.max(0, this.totalItems - this.responsiveVisible);
    if (this.currentIndex > max) this.currentIndex = max;
  }

  updateVisibleCount(): void {
    const w = window.innerWidth;
    if (w <= 360) {
      this.responsiveVisible = this.visibleCount >= 5 ? 1 : 2;
    } else if (w <= 480) {
      this.responsiveVisible = this.visibleCount >= 5 ? 2 : 3;
    } else if (w <= 576) {
      this.responsiveVisible = this.visibleCount >= 5 ? 2 : 3;
    } else if (w <= 768) {
      this.responsiveVisible = this.visibleCount >= 5 ? 3 : 4;
    } else if (w <= 992) {
      this.responsiveVisible = this.visibleCount >= 5 ? 4 : 5;
    } else {
      this.responsiveVisible = this.visibleCount;
    }
  }

  get canPrev(): boolean {
    return this.currentIndex > 0;
  }

  get canNext(): boolean {
    return this.currentIndex + this.responsiveVisible < this.totalItems;
  }

  get translateX(): string {
    const cardWidth = 100 / this.responsiveVisible;
    return `translateX(-${this.currentIndex * cardWidth}%)`;
  }

  get cardStyle(): object {
    return {
      width: `calc(${100 / this.responsiveVisible}% - ${this.gap}px)`,
      'flex-shrink': '0',
      'margin-right': `${this.gap}px`,
    };
  }

  prev(): void {
    if (this.canPrev) this.currentIndex--;
  }
  next(): void {
    if (this.canNext) this.currentIndex++;
  }
}
