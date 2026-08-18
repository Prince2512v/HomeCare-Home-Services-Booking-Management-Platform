import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ROUTES } from '@constants';
import { Button, ButtonInputConfig } from '@common';
import { ServiceDetail as ServiceDetailModel } from '../../models/service-detail.model';
import { ServiceDetailService } from '../../services/service-detail.service.js';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.css',
})
export class ServiceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviceDetailService = inject(ServiceDetailService);

  apiBase = environment.baseUrl;
  service: ServiceDetailModel | null = null;
  isLoading = true;
  selectedImage = '';
  showAllRelated = false;

  addBtnConfig!: ButtonInputConfig;
  viewAllBtnConfig!: ButtonInputConfig;

  ngOnInit(): void {
    this.initButtonConfigs();
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.showAllRelated = false;
      this.loadDetail(id);
    });
  }
  private initButtonConfigs(): void {
    this.addBtnConfig = {
      text: '+ Add',
      cssClass: 'btn-add-main rounded-pill',
      onClick: () => this.addToCart(this.service!.id),
    };
    this.viewAllBtnConfig = {
      text: 'View All',
      cssClass: 'btn-viewAll',
      onClick: () => this.viewAllRelated(),
    };
  }

  loadDetail(id: number): void {
    this.isLoading = true;
    this.serviceDetailService.getServiceDetail(id).subscribe({
      next: (res) => {
        this.service = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  getRelatedAddConfig(related: any): ButtonInputConfig {
    return {
      text: '+ Add',
      cssClass: 'btn-add-glass',
      onClick: () => this.addToCart(related.id),
    };
  }

  selectImage(img: string): void {
    this.selectedImage = img;
  }

  addToCart(serviceId?: number): void {
    this.router.navigate([ROUTES.CUSTOMER.CHECKOUT.CHECKOUT_ABSOLUTE], {
      queryParams: {
        serviceId: serviceId ?? this.service!.id,
        serviceTypeId: this.service!.serviceTypeId,
        serviceName: this.service!.title,
        categoryName: this.service!.categoryName,
      },
    });
  }

  viewAllRelated(): void {
    this.showAllRelated = true;
  }

  goToDetail(id: number): void {
    this.router.navigate([
      ROUTES.CUSTOMER.SERVICE_DETAIL.SERVICE_DETAIL_ABSOLUTE(id),
    ]);
  }
}