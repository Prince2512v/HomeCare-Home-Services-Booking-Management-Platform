import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Button,
  ButtonInputConfig,
  FilterPanel,
  FilterPanelConfig,
  FilterValues,
  ConfirmationModel,
  ConfirmationModelConfig,
  DeleteModel,
  DeleteModelConfig,
  createDeleteConfig,
  PaginationComponent,
} from '@common';
import { DEFAULT_PAGINATION, ROUTES } from '@constants';
import { IdFormat, MobileNumberPipe } from '@pipe';
import { ServicePartnerService } from '@servicepartnerServices';
import { MasterDataService } from '@masterDataServices';
import {
  GetServicePartnerResponseModel,
  FilterServicePartnerRequestModel,
} from '@servicepartnerModels';

@Component({
  selector: 'app-service-partners',
  standalone: true,
  templateUrl: './service-partners.html',
  styleUrl: './service-partners.css',
  imports: [
    CommonModule,
    Button,
    FilterPanel,
    IdFormat,
    MobileNumberPipe,
    ConfirmationModel,
    DeleteModel,
    PaginationComponent,
  ],
})
export class ServicePartners implements OnInit {
  private svc = inject(ServicePartnerService);
  private masterDataSvc = inject(MasterDataService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  servicePartners: GetServicePartnerResponseModel[] = [];
  serviceTypes: { value: string; label: string }[] = [];

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  sortField = 'Name';
  sortDirection: 'asc' | 'desc' = 'asc';
  maxJobsCompleted = 0;

  isLoading = false;
  errorMessage = '';

  isFilterOpen = false;
  activeFilters: any = {};

  activeDropdownId: number | null = null;
  activeRawFilterValues: FilterValues = {};

  isConfirmModalOpen = false;
  confirmConfig: ConfirmationModelConfig | null = null;
  pendingAction: (() => void) | null = null;

  isDeleteModalOpen = false;
  deleteConfig: DeleteModelConfig | null = null;
  private partnerToDelete: { id: number; name: string } | null = null;

  filterButtonConfig: ButtonInputConfig = {
    variant: 'filter',
    onClick: () => (this.isFilterOpen = true),
  };

  ngOnInit(): void {
    this.loadServicePartners();
    this.loadServiceTypes();
  }

  loadServiceTypes(): void {
    this.masterDataSvc.getServiceTypes().subscribe({
      next: (res) => {
        this.serviceTypes = (res.data.records || []).map((s) => ({
          value: s.serviceName,
          label: s.serviceName,
        }));
      },
    });
  }

  loadServicePartners(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: FilterServicePartnerRequestModel = {
      ...this.activeFilters,
      sortField: this.sortField,
      sortDirection: this.sortDirection,
    };

    this.svc.getServicePartners(this.currentPage, this.itemsPerPage, filters).subscribe({
      next: (res) => {
        this.servicePartners = res.data.records;
        this.totalItems = res.data.totalRecords;
        this.updateJobsCompletedMax(res.data.filterMeta?.maxBookedServices ?? 0);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load service partners.';
        this.isLoading = false;
      },
    });
  }

  navigateToDetail(id: number): void {
    this.router.navigate([
      ROUTES.USER_MANAGEMENT.SERVICE_PARTNERS.SERVICE_PARTNER_DETAIL_ABSOLUTE,
      id,
    ]);
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadServicePartners();
  }

  isFilterActive(): boolean {
    return Object.values(this.activeFilters).some((v) => v !== null && v !== undefined);
  }

  getFilterPanelConfig(): FilterPanelConfig {
    return {
      title: 'Filter',
      fields: [
        {
          key: 'serviceTypeName',
          label: 'Job',
          type: 'select',
          placeholder: 'All Jobs',
          options: this.serviceTypes,
        },
        {
          key: 'jobsCompleted',
          label: 'Jobs Completed',
          type: 'number-range',
          max: this.maxJobsCompleted,
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          placeholder: 'All Status',
          options: [
            { value: 1, label: 'Active' },
            { value: 0, label: 'Inactive' },
            { value: 2, label: 'Pending' },
            { value: 3, label: 'Rejected' },
          ],
        },
      ],

      onFilter: (values: FilterValues) => {
        this.activeRawFilterValues = values;
        const filters: any = {};

        if (values['serviceTypeName']) {
          filters.serviceTypeName = values['serviceTypeName'];
        }

        if (values['jobsCompleted_min']) {
          filters.jobsCompletedMin = values['jobsCompleted_min'];
        }

        if (values['jobsCompleted_max']) {
          filters.jobsCompletedMax = values['jobsCompleted_max'];
        }

        if (values['status'] !== undefined && values['status'] !== null) {
          filters.status = Number(values['status']);
        }

        this.activeFilters = filters;
        this.currentPage = 1;
        this.loadServicePartners();
        this.isFilterOpen = false;
      },

      onCancel: () => {
        this.activeRawFilterValues = {};
        this.activeFilters = {};
        this.currentPage = 1;
        this.loadServicePartners();
        this.isFilterOpen = false;
      },
    };
  }
  get activeFilterValues(): Record<string, any> | null {
    return Object.keys(this.activeFilters).length ? this.activeRawFilterValues : null;
  }
  private updateJobsCompletedMax(max: number): void {
    this.maxJobsCompleted = max;
  }

  toggleDropdown(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  closeDropdowns(): void {
    this.activeDropdownId = null;
  }

  onToggleStatus(partner: GetServicePartnerResponseModel): void {
    const newStatus = partner.status === 'Active' ? 'Inactive' : 'Active';

    this.confirmConfig = {
      title: 'Confirmation',
      message: `Are you sure you want to ${newStatus.toLowerCase()} ${partner.name}?`,
      confirmText: 'Proceed',
      cancelText: 'Cancel',
    };

    this.pendingAction = () => {
      this.svc.toggleServicePartnerStatus(partner.id).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadServicePartners();
        },
        error: (err) =>
          this.toastr.error(err.error?.message || `Failed to ${newStatus.toLowerCase()} partner`),
      });
    };

    this.isConfirmModalOpen = true;
    this.activeDropdownId = null;
  }

  onDeletePartner(partner: GetServicePartnerResponseModel): void {
    this.partnerToDelete = { id: partner.id, name: partner.name };
    this.deleteConfig = createDeleteConfig(partner.name);
    this.isDeleteModalOpen = true;
    this.activeDropdownId = null;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteConfig = null;
    this.partnerToDelete = null;
  }

  confirmDelete(): void {
    if (!this.partnerToDelete) return;
    this.svc.deleteServicePartner(this.partnerToDelete.id).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.closeDeleteModal();
        this.loadServicePartners();
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
        this.closeDeleteModal();
      },
    });
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.isConfirmModalOpen = false;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadServicePartners();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadServicePartners();
  }
}