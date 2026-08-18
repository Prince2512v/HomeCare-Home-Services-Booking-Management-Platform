import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ROUTES } from 'src/app/common/constants/route-paths';
import { FormateCountPipe } from 'src/app/common/pipes';
import { Button, ButtonInputConfig, Carousel, CarouselConfig } from '@common';
import {
  ServiceTypes,
  PopularService,
  AllService,
  DashboardCounts,
} from '../../models/service.model';
import { SearchBar } from '../search-bar/search-bar';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SearchBar, Carousel, FormateCountPipe, Button],
  templateUrl: './home.html',
  styleUrl: './home.css',
  encapsulation: ViewEncapsulation.None,
})
export class Home implements OnInit {
  private homeService = inject(HomeService);
  private router = inject(Router);

  serviceTypes: ServiceTypes[] = [];
  popularServices: PopularService[] = [];
  allServices: AllService[] = [];
  counts: DashboardCounts | null = null;
  apiBase = environment.baseUrl;

  isCountsLoading = true;
  isServiceTypesLoading = true;
  isPopularLoading = true;
  isAllServicesLoading = true;

  isCountsError = false;
  isServiceTypesError = false;
  isPopularError = false;
  isAllServicesError = false;

  serviceTypeConfig!: CarouselConfig;
  popularConfig!: CarouselConfig;
  allServiceConfig!: CarouselConfig;

  joinNowConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.initConfig();
    this.loadCounts();
    this.loadCarousels();
  }

  addToCartConfig(service: any): ButtonInputConfig {
    return {
      text: '+ Add',
      cssClass: 'add-btn rounded-pill',
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        this.addToCart(service);
      },
    };
  }

  addToCart(service: AllService | PopularService): void {
    this.router.navigate([ROUTES.CUSTOMER.CHECKOUT.CHECKOUT_ABSOLUTE], {
      queryParams: {
        serviceId: service.id,
        serviceTypeId: service.serviceTypeId,
        serviceName: service.title,
        categoryName: service.selectedCategoryName,
      },
    });
  }

  private initConfig(): void {
    this.joinNowConfig = {
      text: 'Join Now',
      cssClass:
        'rounded-pill position-absolute btn-position border-0 fw-semibold',
      onClick: () => this.goToOnboarding(),
    };

    this.serviceTypeConfig = { totalItems: 0, visibleCount: 6, gap: 16 };
    this.popularConfig = {
      totalItems: 0,
      visibleCount: 5,
      gap: 16,
      title: 'Popular Services',
      seeMoreLink: '/services',
    };
    this.allServiceConfig = {
      totalItems: 0,
      visibleCount: 5,
      gap: 16,
      title: 'All Services',
      seeMoreLink: '/services',
    };
  }

  goToServiceListing(serviceTypeId: number): void {
    this.router.navigate([
      `${ROUTES.CUSTOMER.SERVICE_LISTING.SERVICE_LISTING_ABSOLUTE}/${serviceTypeId}`,
    ]);
  }

  goToServiceDetail(serviceId: number): void {
    this.router.navigate([
      ROUTES.CUSTOMER.SERVICE_DETAIL.SERVICE_DETAIL_ABSOLUTE(serviceId),
    ]);
  }

  goToOnboarding(): void {
    this.router.navigate([
      ROUTES.SERVICE_PARTNER.ONBOARDING.ONBOARDING_ABSOLUTE,
    ]);
  }

  private loadCounts(): void {
    this.isCountsLoading = true;
    this.isCountsError = false;

    this.homeService.getDashboardCounts().subscribe({
      next: (res) => {
        this.counts = res.data;
        this.isCountsLoading = false;
      },
      error: () => {
        this.isCountsError = true;
        this.isCountsLoading = false;
      },
    });
  }

  private loadCarousels(): void {
    this.isServiceTypesLoading = true;
    this.isPopularLoading = true;
    this.isAllServicesLoading = true;

    this.homeService.getServiceTypes().subscribe({
      next: (res) => {
        this.serviceTypes = res.data;
        this.serviceTypeConfig = {
          ...this.serviceTypeConfig,
          totalItems: res.data.length,
        };
        this.isServiceTypesLoading = false;
      },
      error: () => {
        this.isServiceTypesError = true;
        this.isServiceTypesLoading = false;
      },
    });

    this.homeService.getPopularServices().subscribe({
      next: (res) => {
        const available = res.data.filter((s) => s.isAvailable);
        this.popularServices = available;
        this.popularConfig = {
          ...this.popularConfig,
          totalItems: available.length,
        };
        this.isPopularLoading = false;
      },
      error: () => {
        this.isPopularError = true;
        this.isPopularLoading = false;
      },
    });

    this.homeService.getAllServices().subscribe({
      next: (res) => {
        const available = res.data.filter((s) => s.isAvailable);
        this.allServices = available;
        this.allServiceConfig = {
          ...this.allServiceConfig,
          totalItems: available.length,
        };
        this.isAllServicesLoading = false;
      },
      error: () => {
        this.isAllServicesError = true;
        this.isAllServicesLoading = false;
      },
    });
  }
}