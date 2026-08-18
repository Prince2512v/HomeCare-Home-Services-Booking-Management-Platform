import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@dashboardServices';
import { MetricCardModel } from '@dashboardModels';
import {
  StatCard,
  StatCardConfig,
  TopPerformingServices,
  RevenueOverview,
  TopCities,
  TopServicePartners,
} from '@dashboardComponents';
import { forkJoin } from 'rxjs';

const EMPTY_METRIC: MetricCardModel = {
  currentValue: 0,
  previousValue: 0,
  changePercent: 0,
  isIncrease: false,
};

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    StatCard,
    TopPerformingServices,
    RevenueOverview,
    TopCities,
    TopServicePartners,
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {
  private svc = inject(DashboardService);

  isLoading = true;
  data = false;

  totalServicesData: MetricCardModel = EMPTY_METRIC;
  activeUsersData: MetricCardModel = EMPTY_METRIC;
  activePartnersData: MetricCardModel = EMPTY_METRIC;
  totalRevenueData: MetricCardModel = EMPTY_METRIC;

  totalServicesConfig: StatCardConfig = {
    label: 'Total Services Booked',
    iconSrc: 'assets/images/admin/HandHeart-white.svg',
    formatFn: (v) => this.formatK(v),
  };

  activeUsersConfig: StatCardConfig = {
    label: 'Active Users',
    iconSrc: 'assets/images/admin/User-white.svg',
    formatFn: (v) => this.formatK(v),
  };

  activePartnersConfig: StatCardConfig = {
    label: 'Active Service Partners',
    iconSrc: 'assets/images/admin/Wrench-white.svg',
    formatFn: (v) => this.formatK(v),
  };

  totalRevenueConfig: StatCardConfig = {
    label: 'Total Revenue',
    iconSrc: 'assets/images/admin/Rupee-white.svg',
    formatFn: (v) => this.formatRevenue(v),
  };

  ngOnInit(): void {
    this.loadStatCards();
  }

  private loadStatCards(): void {
    forkJoin({
      services: this.svc.getTotalServicesBooked(),
      users: this.svc.getActiveUsers(),
      partners: this.svc.getActiveServicePartners(),
      revenue: this.svc.getTotalRevenue(),
    }).subscribe({
      next: (res) => {
        if (res.services.isSuccess && res.services.data) this.totalServicesData = res.services.data;
        if (res.users.isSuccess && res.users.data) this.activeUsersData = res.users.data;
        if (res.partners.isSuccess && res.partners.data)
          this.activePartnersData = res.partners.data;
        if (res.revenue.isSuccess && res.revenue.data) this.totalRevenueData = res.revenue.data;
        this.isLoading = false;
        this.data = true;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private formatK(v: number): string {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(1) + 'k';
    return String(Math.round(v));
  }

  private formatRevenue(v: number): string {
    if (v >= 1_000_000) return '₹' + (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(0) + 'k';
    return '₹' + Math.round(v);
  }
}