import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HomeService } from '@HomeService';
import { ROUTES } from 'src/app/common/constants/route-paths';
import { Button,ButtonInputConfig } from '@common';
import { ServiceNames } from '../../models/service.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule,Button],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar implements OnInit {
  searchQuery = '';
  showDropdown = false;
  filteredServices: ServiceNames[] = [];
  allServices: ServiceNames[] = [];
  selectedService: ServiceNames | null = null;
  searchBtnConfig!: ButtonInputConfig;

  constructor(
    private homeService: HomeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.initConfig();
  }

  private loadServices(): void {
    this.homeService.getServices().subscribe({
      next: (services) => {
        this.allServices = services.data ?? [];
      },
    });
  }

  private initConfig(): void {
    this.searchBtnConfig = {
      text: 'Search',
      cssClass: 'btn btn-purple text-nowrap rounded-pill px-4 py-2 fw-medium',
      onClick: this.onSearchClick.bind(this),
    };
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.selectedService = null;
    if (query.length === 0) {
      this.filteredServices = [];
      return;
    }
    this.filteredServices = this.allServices.filter((s) =>
      s.name.toLowerCase().includes(query),
    );
  }

  selectService(service: ServiceNames): void {
    this.searchQuery = service.name;
    this.selectedService = service;
    this.showDropdown = false;
    this.filteredServices = [];
  }

  onSearchClick(): void {
    if (this.selectedService) {
      this.goToServiceDetail(this.selectedService.id);
      return;
    }
    const match = this.allServices.find(
      (s) => s.name.toLowerCase() === this.searchQuery.toLowerCase().trim(),
    );
    if (match) {
      this.goToServiceDetail(match.id);
    }
  }

  hideDropdown(): void {
    setTimeout(() => (this.showDropdown = false), 150);
  }

  goToServiceDetail(serviceId: number): void {
    this.router.navigate([
      ROUTES.CUSTOMER.SERVICE_DETAIL.SERVICE_DETAIL_ABSOLUTE(serviceId),
    ]);
  }
}