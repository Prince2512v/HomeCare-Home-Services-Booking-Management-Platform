import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingByServiceTypeModel } from '../../../models';
import { DashboardService } from '../../../services';

type Period = 'week' | 'month' | 'year';

@Component({
  selector: 'app-top-performing-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-performing-services.html',
  styleUrl: './top-performing-services.css',
})
export class TopPerformingServices implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('donutCanvas') donutCanvasRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  activePeriod: Period = 'week';
  servicesData: BookingByServiceTypeModel[] = [];
  private viewReady = false;

  readonly DONUT_COLORS = [
    '#f87171',
    '#38bdf8',
    '#fb923c',
    '#4ade80',
    '#facc15',
    '#c084fc',
    '#f472b6',
    '#34d399',
    '#60a5fa',
    '#a78bfa',
  ];

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.scheduleChart();
  }
  ngOnDestroy(): void {}

  selectPeriod(p: Period): void {
    if (this.activePeriod === p) return;
    this.activePeriod = p;
    this.fetchData();
  }

  private fetchData(): void {
    this.svc.getServiceTypeBookings(this.activePeriod).subscribe({
      next: (res) => {
        this.servicesData = res.data ?? [];
        this.cdr.detectChanges();
        this.scheduleChart();
      },
    });
  }

  donutColor(i: number): string {
    return this.DONUT_COLORS[i % this.DONUT_COLORS.length];
  }

  get totalBookings(): number {
    return this.servicesData.reduce((s, r) => s + r.bookingCount, 0);
  }

  formatK(v: number): string {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(1) + 'k';
    return String(Math.round(v));
  }

  private scheduleChart(): void {
    setTimeout(() => this.drawDonutChart(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.viewReady) this.scheduleChart();
  }

  private drawDonutChart(): void {
    if (!this.viewReady) return;
    const canvas = this.donutCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth || 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const rows = this.servicesData;
    const total = rows.reduce((s, r) => s + r.bookingCount, 0);
    const cx = size / 2;
    const cy = size / 2;
    const ringWidth = size * 0.13;
    const outerR = size / 2 - 4;
    const innerR = outerR - ringWidth;
    const gapRad = rows.length > 1 ? 0.04 : 0;

    ctx.clearRect(0, 0, size, size);

    if (!rows.length || total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
      ctx.fillStyle = '#e5e7eb';
      ctx.fill('evenodd');
    } else {
      let startAngle = -Math.PI / 2;
      rows.forEach((row, i) => {
        const sliceAngle = (row.bookingCount / total) * Math.PI * 2;
        const start = startAngle + gapRad / 2;
        const end = startAngle + sliceAngle - gapRad / 2;
        if (end > start) {
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, start, end);
          ctx.arc(cx, cy, innerR, end, start, true);
          ctx.closePath();
          ctx.fillStyle = this.DONUT_COLORS[i % this.DONUT_COLORS.length];
          ctx.fill();
        }
        startAngle += sliceAngle;
      });
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(size * 0.16)}px Alexandria,sans-serif`;
    ctx.fillStyle = '#111827';
    ctx.fillText(this.formatK(total), cx, cy - size * 0.05);
    ctx.font = `${Math.round(size * 0.085)}px Alexandria,sans-serif`;
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Bookings', cx, cy + size * 0.09);
  }
}
