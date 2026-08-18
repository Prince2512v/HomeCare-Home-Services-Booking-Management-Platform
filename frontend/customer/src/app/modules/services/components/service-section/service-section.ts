import { Component, inject, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormateCountPipe } from '@pipes';
import { ServicesSectionService } from '@ServiceSectionServices';
import { ServiceTypeWithTotalBooking } from '@ServiceSectionModels';
import { Router } from '@angular/router';
import { ROUTES } from '@constants';

@Component({
  selector: 'app-service-section',
  imports: [FormateCountPipe],
  templateUrl: './service-section.html',
  styleUrl: './service-section.css',
})
export class ServiceSection implements OnInit {
  private servicesSectionService = inject(ServicesSectionService);
  private router = inject(Router);

  items: ServiceTypeWithTotalBooking[] = [];
  isLoading = true;
  hasError = false;
  baseUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadServicesData();
  }

  loadServicesData() {
    this.servicesSectionService.getServiceTypes().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  goToServiceListing(serviceTypeId: number): void {
    this.router.navigate([
      `${ROUTES.CUSTOMER.SERVICE_LISTING.SERVICE_LISTING_ABSOLUTE}/${serviceTypeId}`,
    ]);
  }
}