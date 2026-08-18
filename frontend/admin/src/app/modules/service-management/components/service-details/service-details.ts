import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '@models';
import { Button,ButtonInputConfig } from '@common';
import { ROUTES } from '@constants';
import { ServiceManagementService } from '../../services/service-management.service';
import {
  GetServiceByIdResponseModel,
  GetSubCategoryResponseModel,
  DataQueryResponseModel,
} from '../../models/service-management.model';
import { AddServiceModal } from '../add-service-modal/add-service-modal';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, AddServiceModal, Button],
  templateUrl: './service-details.html',
  styleUrl: './service-details.css',
})
export class ServiceDetail implements OnInit {
  serviceId!: number;
  service: GetServiceByIdResponseModel | null = null;
  isLoading = true;
  editServiceId: number | null = null;
  isEditModalOpen = false;
  subCategoriesForEdit: GetSubCategoryResponseModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ServiceManagementService
  ) {}

  editConfig: ButtonInputConfig = {
    variant: 'edit',
    text: 'Edit',
    onClick: () => this.openEdit(),
  };
  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadService();
  }
  loadService(): void {
    this.isLoading = true;
    this.svc.getServiceById(this.serviceId).subscribe({
      next: (res) => {
        this.service = res?.data ?? null;

        if (!this.service) {
          this.isLoading = false;
          return;
        }

        if ((this.service as any).categoryId) {
          this.loadSubCategories((this.service as any).categoryId);
        } else {
          this.findCategoryAndLoadSubCategories();
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  findCategoryAndLoadSubCategories(): void {
    this.svc.getServiceTypes().subscribe({
      next: (typeRes) => {
        const matchedType = (typeRes?.data?.records ?? []).find(
          (t) => t.serviceName === this.service!.serviceTypeName
        );

        if (matchedType) {
          this.svc.getCategoriesByServiceType(matchedType.id).subscribe({
            next: (catRes) => {
              const matchedCat = (catRes?.data?.records ?? []).find(
                (c) => c.categoryName === this.service!.categoryName
              );

              if (matchedCat) {
                this.loadSubCategories(matchedCat.id);
              } else {
                this.isLoading = false;
              }
            },
            error: () => (this.isLoading = false),
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  loadSubCategories(categoryId: number): void {
    this.svc.getSubCategoriesByCategory(categoryId).subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetSubCategoryResponseModel>>) => {
        this.subCategoriesForEdit = res?.data?.records ?? [];

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openEdit(): void {
    this.editServiceId = this.service?.id ?? null;
    this.isEditModalOpen = true;
  }
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editServiceId = null;
  }

  handleSave(): void {
    this.closeEditModal();
    this.loadService();
  }

  goBack(): void {
    this.router.navigate([ROUTES.SERVICE_MANAGEMENT.SERVICE_MANAGEMENT_ABSOLUTE]);
  }
}