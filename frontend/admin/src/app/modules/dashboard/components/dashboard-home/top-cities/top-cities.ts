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
import { CityBookingModel } from '../../../models';
import { DashboardService } from '../../../services';

type Period = 'week' | 'month' | 'year';

@Component({
  selector: 'app-top-cities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-cities.html',
  styleUrl: './top-cities.css',
})
export class TopCities implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cityCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  activePeriod: Period = 'week';
  cityData: CityBookingModel[] = [];
  cityPage = 0;
  isLoading = false;
  private viewReady = false;

  readonly CITY_COLORS = [
    '#f97316',
    '#a855f7',
    '#22c55e',
    '#ef4444',
    '#06b6d4',
    '#eab308',
    '#4f46e5',
    '#ec4899',
    '#84cc16',
    '#f43f5e',
    '#0ea5e9',
    '#d946ef',
  ];

  ngOnInit(): void {
    this.loadCities();
  }
  ngAfterViewInit(): void {
    this.viewReady = true;
  }
  ngOnDestroy(): void {}

  selectPeriod(p: Period): void {
    if (this.activePeriod === p) return;
    this.activePeriod = p;
    this.cityPage = 0;
    this.loadCities();
  }

  private loadCities(): void {
    this.isLoading = true;
    this.svc.getCityBookings(this.activePeriod).subscribe({
      next: (res) => {
        this.cityData = (res.data?.cities ?? []).map((c) => ({
          ...c,
          cityName: c.cityName?.split(',')[0].trim() ?? c.cityName,
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scheduleChart();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  prevPage(): void {
    if (this.cityPage > 0) {
      this.cityPage--;
      this.scheduleChart();
    }
  }
  nextPage(): void {
    if (this.cityPage < this.totalPages - 1) {
      this.cityPage++;
      this.scheduleChart();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.cityData.length / 2));
  }
  get visibleCities(): CityBookingModel[] {
    return this.cityData.slice(this.cityPage * 2, this.cityPage * 2 + 2);
  }

  cityColor(globalIndex: number): string {
    return this.CITY_COLORS[globalIndex % this.CITY_COLORS.length];
  }

  private scheduleChart(): void {
    setTimeout(() => this.drawChart(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.viewReady) this.scheduleChart();
  }

  private drawChart(): void {
    if (!this.viewReady) return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth || 560;
    canvas.height = canvas.offsetHeight || 224;
    const W = canvas.width,
      H = canvas.height;
    const padL = 54,
      padR = 16,
      padT = 16,
      padB = 34;
    const chartW = W - padL - padR,
      chartH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);
    const visible = this.visibleCities;

    if (!visible.length) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px Alexandria,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', W / 2, H / 2);
      return;
    }

    const allVals = visible.flatMap((c) => c.points.map((p) => p.bookingCount));
    const maxVal = Math.max(...allVals, 1);
    const labels = visible[0].points.map((p) => p.dayName);

    ctx.font = '11px Alexandria,sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padT + chartH - (i / 5) * chartH;
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(String(Math.round((maxVal / 5) * i)), padL - 6, y + 4);
    }

    visible.forEach((city, ci) => {
      const color = this.cityColor(this.cityPage * 2 + ci);
      const pts = city.points.map((p, i) => ({
        x: padL + (labels.length > 1 ? (i / (labels.length - 1)) * chartW : chartW / 2),
        y: padT + chartH - (p.bookingCount / maxVal) * chartH,
      }));

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((pt, i) => {
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
          return;
        }
        const prev = pts[i - 1];
        const cpX = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cpX, prev.y, cpX, pt.y, pt.x, pt.y);
      });
      ctx.stroke();

      pts.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Alexandria,sans-serif';
    ctx.textAlign = 'center';
    const step = Math.ceil(labels.length / 10);
    labels.forEach((label, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return;
      const x = padL + (labels.length > 1 ? (i / (labels.length - 1)) * chartW : chartW / 2);
      ctx.fillText(label, x, padT + chartH + 18);
    });
  }
}