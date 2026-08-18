import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Button, ButtonInputConfig } from '@common';
import { ServiceListingService } from '@ServiceListingService';
import {
  ServiceTypeWithCategories,
  ServiceListItem,
  ServiceSearchResult,
} from '@ServiceListingModels';
import { ROUTES } from '@constants';

@Component({
  selector: 'app-service-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './servicelisting.html',
  styleUrl: './servicelisting.css',
})
export class ServiceListing implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ServiceListingService);
  private router = inject(Router);

  apiBase = environment.baseUrl;

  serviceTypeId = 0;
  serviceTypeData: ServiceTypeWithCategories | null = null;
  services: (ServiceListItem | ServiceSearchResult)[] = [];

  expandedCategories: number[] = [];
  selectedSubCategoryId: number | null = null;
  selectedCategoryName: string = '';

  displayTitle = 'All Services';
  totalCount = 0;
  searchQuery = '';
  isSearchMode = false;

  getAddConfig(service: any): ButtonInputConfig {
    return {
      text: '+ Add',
      cssClass: 'btn-add-glass',
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        this.addToCart(service);
      },
    };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('serviceTypeId'));
      if (id && id !== this.serviceTypeId) {
        this.serviceTypeId = id;
        window.scrollTo(0, 0);
        this.loadMeta();
      }
    });
  }

  /* ================= META ================= */

  private loadMeta(): void {
    this.svc.getServiceTypeWithCategories(this.serviceTypeId).subscribe({
      next: (res) => {
        this.serviceTypeData = res.data;

        if (res.data.categories?.length) {
          const firstCat = res.data.categories[0];
          this.expandedCategories = [firstCat.categoryId];

          if (firstCat.subCategories?.length) {
            const firstSub = firstCat.subCategories[0];
            this.loadBySubCategory(
              firstSub.subCategoryId,
              firstSub.subCategoryName,
              firstCat.categoryName,
            );
          } else {
            this.loadAll();
          }
        } else {
          this.loadAll();
        }
      },
    });
  }

  /* ================= SERVICES ================= */

  loadAll(): void {
    this.selectedSubCategoryId = null;
    this.isSearchMode = false;
    this.displayTitle = 'All Services';

    this.svc.searchServices(this.serviceTypeId).subscribe((res) => {
      this.services = res.data;
      this.totalCount = res.data.length;
    });
  }

  loadBySubCategory(
    subCategoryId: number,
    subCategoryName: string,
    categoryName: string,
  ): void {
    this.selectedCategoryName = categoryName;
    if (this.selectedSubCategoryId === subCategoryId) return;

    this.selectedSubCategoryId = subCategoryId;
    this.isSearchMode = false;
    this.displayTitle = subCategoryName;

    this.svc.getServicesBySubCategory(subCategoryId).subscribe((res) => {
      this.services = res.data.services.filter(
        (s: any) => s.isAvailable !== false,
      );
      this.totalCount = this.services.length;
    });
  }

  /* ================= SEARCH ================= */

  onSearchInput(): void {
    const term = this.searchQuery.trim();

    if (!term) {
      this.loadAll();
      return;
    }

    this.isSearchMode = true;
    this.selectedSubCategoryId = null;
    this.displayTitle = `Search results for: "${term}"`;

    this.svc.searchServices(this.serviceTypeId, term).subscribe((res) => {
      this.services = res.data;
      this.totalCount = res.data.length;
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadAll();
  }

  /* ================= CATEGORY ================= */

  toggleCategory(categoryId: number): void {
    if (this.expandedCategories.includes(categoryId)) {
      this.expandedCategories = [];
    } else {
      this.expandedCategories = [categoryId];
    }
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.includes(categoryId);
  }

  addToCart(service: ServiceListItem | ServiceSearchResult): void {
    this.router.navigate([ROUTES.CUSTOMER.CHECKOUT.CHECKOUT_ABSOLUTE], {
      queryParams: {
        serviceId: service.id,
        serviceTypeId: this.serviceTypeId,
        serviceName: service.name,
        categoryName: this.selectedCategoryName,
      },
    });
  }

  viewDetails(service: ServiceListItem | ServiceSearchResult): void {
    this.router.navigate([
      ROUTES.CUSTOMER.SERVICE_DETAIL.SERVICE_DETAIL_ABSOLUTE(service.id),
    ]);
  }

  getImageUrl(image: string | null | undefined): string {
    return image ? this.apiBase + image : 'assets/images/home/AC Cleaning.jpg';
  }
}