import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyRevenueModel } from '../../../models';
import { DashboardService } from '../../../services';

type Period = 'week' | 'month' | 'year';

@Component({
  selector: 'app-revenue-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue-overview.html',
  styleUrl: './revenue-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueOverview implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private svc = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  activePeriod: Period = 'week';
  revenueData: WeeklyRevenueModel[] = [];
  private viewReady = false;

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
    this.svc.getRevenue(this.activePeriod).subscribe({
      next: (res) => {
        this.revenueData = res.data ?? [];
        this.cdr.detectChanges();
        this.scheduleChart();
      },
    });
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

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement!.getBoundingClientRect();
    const W = rect.width,
      H = rect.height;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const rows = this.revenueData;
    const isMonth = this.activePeriod === 'month';
    const isYear = this.activePeriod === 'year';

    const isVeryNarrowPad = W <= 380;
    const padL = isVeryNarrowPad ? 46 : 65,
      padR = isVeryNarrowPad ? 8 : 20,
      padT = 30,
      padB = 40;
    const chartW = W - padL - padR,
      chartH = H - padT - padB;

    const labels = rows.map((r) => {
      if (isMonth) return String(r.dayName.match(/\d+/)?.[0] ?? r.dayName);
      if (isYear) return r.dayName.slice(0, 3);
      return r.dayName;
    });

    const values = rows.map((r) => r.revenue);
    const rawMax = Math.max(...values, 100);
    const max = rawMax > 1000 ? Math.ceil(rawMax / 1000) * 1000 : Math.ceil(rawMax / 500) * 500;

    ctx.clearRect(0, 0, W, H);
    const yAxisFontSize = isVeryNarrowPad ? 10 : 13;
    ctx.font = `500 ${yAxisFontSize}px Alexandria, sans-serif`;

    for (let i = 0; i <= 5; i++) {
      const y = Math.floor(padT + chartH - (i / 5) * chartH) + 0.5;
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'right';
      ctx.font = `500 ${yAxisFontSize}px Alexandria, sans-serif`;
      ctx.fillText(this.formatRevenue((max / 5) * i), padL - (isVeryNarrowPad ? 5 : 15), y + 4);
    }

    const gap = chartW / Math.max(labels.length, 1);
    const barW = isMonth ? Math.max(2, gap * 0.22) : 10;

    const isNarrow = W <= 420;
    const isVeryNarrow = W <= 380;

    let labelFontSize: number;
    if (isYear) {
      const maxLabelWidth = gap * 0.95;
      labelFontSize = Math.min(13, Math.max(7, maxLabelWidth / 2.2));
      if (isVeryNarrow) labelFontSize = Math.min(labelFontSize, 8);
      else if (isNarrow) labelFontSize = Math.min(labelFontSize, 10);
    } else if (isMonth) {
      labelFontSize = isVeryNarrow ? 8 : isNarrow ? 9 : 10;
    } else {
      const maxLabelWidth = gap * 0.95;
      labelFontSize = Math.min(13, Math.max(8, maxLabelWidth / 2.2));
      if (isVeryNarrow) labelFontSize = Math.min(labelFontSize, 9);
      else if (isNarrow) labelFontSize = Math.min(labelFontSize, 11);
    }

    const minLabelSpacing = labelFontSize * 2.5;
    const skipAlternate = gap < minLabelSpacing && labels.length > 7;

    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const bH = (values[i] / max) * chartH;
      const x = padL + gap * i + (gap - barW) / 2;
      const y = padT + chartH - bH;
      ctx.fillStyle = '#4338ca';
      if (bH > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, barW, bH, [barW / 2, barW / 2, 0, 0]);
        ctx.fill();
      }
      if (skipAlternate && i % 2 !== 0) return;
      ctx.fillStyle = '#6b7280';
      ctx.font = `500 ${labelFontSize}px Alexandria, sans-serif`;
      ctx.fillText(label, padL + gap * i + gap / 2, padT + chartH + 25);
    });
  }

  formatRevenue(v: number): string {
    if (v === 0) return '0';
    if (v >= 1_000_000) return `${Math.round(v / 1_000_000)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
    return `${v}`;
  }
}
