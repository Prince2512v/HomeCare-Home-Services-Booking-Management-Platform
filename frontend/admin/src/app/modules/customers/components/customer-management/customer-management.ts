import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import {
  Button,
  ButtonInputConfig,
  PaginationComponent,
  DeleteModel,
  DeleteModelConfig,
  createDeleteConfig,
  FilterPanel,
  FilterPanelConfig,
  FilterValues,
  ConfirmationModel,
  ConfirmationModelConfig,
} from '@common';
import { CustomerManagementService } from '@customerManagementServices';
import {
  GetCustomerResponseModel,
  FilterCustomerRequestModel,
  CreateCustomerRequestModel,
} from '@customerManagementModels';
import { IdFormat, MobileNumberPipe } from '@pipe';
import { CustomerModal } from '../customer-modal/customer-modal';

@Component({
  selector: 'app-customer-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    PaginationComponent,
    DeleteModel,
    CustomerModal,
    FilterPanel,
    IdFormat,
    MobileNumberPipe,
    ConfirmationModel,
  ],
  templateUrl: './customer-management.html',
  styleUrl: './customer-management.css',
})
export class CustomerManagement implements OnInit {
  customers: GetCustomerResponseModel[] = [];
  isLoading = false;
  errorMessage = '';
  showModal = false;
  isDeleteModalOpen = false;
  deleteConfig: DeleteModelConfig | null = null;
  activeDropdownId: number | null = null;
  isBlockModalOpen = false;
  blockConfig: ConfirmationModelConfig | null = null;
  private selectedBlockCustomer: GetCustomerResponseModel | null = null;

  currentPage = 1;
  totalItems = 0;
  itemsPerPage = 10;

  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  private selectedCustomerId: number | null = null;
  private readonly destroyRef = inject(DestroyRef);

  filter: FilterCustomerRequestModel = {
    pageNumber: 1,
    pageSize: 10,
    status: null,
    bookingMin: null,
    bookingMax: null,
    sortField: 'id',
    sortDirection: 'asc',
  };

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;

  filterPanelConfig!: FilterPanelConfig;
  filterConfig!: ButtonInputConfig;
  addConfig!: ButtonInputConfig;

  constructor(
    private customerManagementService: CustomerManagementService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  navigateToDetail(id: number): void {
    this.router.navigate(['/user-management/customers', id]);
  }

  ngOnInit(): void {
    this.initConfigs();
    this.loadCustomers();
  }

  private initConfigs(): void {
    this.filterPanelConfig = {
      fields: [
        {
          key: 'bookingCount',
          label: 'Bookings',
          type: 'number-range',
          min: 0,
          step: 1,
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          placeholder: 'Status',
          options: [
            { label: 'Active', value: 'Active' },
            { label: 'Blocked', value: 'Blocked' },
          ],
        },
      ],
      onFilter: (values: FilterValues) => this.applyFilter(values),
      onCancel: () => this.cancelFilter(),
    };

    this.filterConfig = {
      variant: 'filter',
      type: 'button',
      onClick: () => (this.isFilterOpen = true),
    };

    this.addConfig = {
      variant: 'add',
      type: 'button',
      onClick: () => (this.showModal = true),
    };
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filter.sortField = this.sortField;
    this.filter.sortDirection = this.sortDirection;
    this.currentPage = 1;
    this.filter.pageNumber = 1;
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerManagementService
      .getAllCustomers(this.filter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.customers = res.data.records;
            this.totalItems = res.data.totalRecords;
            this.updateBookingCountMax(res.data.filterMeta?.maxBookingCount ?? 0);
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load customers.';
          this.isLoading = false;
        },
      });
  }

  private updateBookingCountMax(max: number): void {
    const field = this.filterPanelConfig.fields.find((f) => f.key === 'bookingCount');
    if (field) field.max = max;
  }

  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    this.filter.status = (values['status'] as string) || null;
    this.filter.bookingMin = (values['bookingCount_min'] as number) ?? null;
    this.filter.bookingMax = (values['bookingCount_max'] as number) ?? null;
    this.filter.pageNumber = 1;
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadCustomers();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilterValues = null;
    this.filter.status = null;
    this.filter.bookingMin = null;
    this.filter.bookingMax = null;
    this.filter.pageNumber = 1;
    this.currentPage = 1;
    this.loadCustomers();
  }

  saveCustomer(request: CreateCustomerRequestModel): void {
    this.customerManagementService
      .createCustomer(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.closeModal();
            this.loadCustomers();
          }
        },
        error: (err) => this.toastr.error(err?.error?.message),
      });
  }

  onToggleStatus(customer: GetCustomerResponseModel): void {
    this.customerManagementService
      .updateStatus(customer.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.loadCustomers();
          }
        },
        error: (err) => this.toastr.error(err?.error?.message),
      });
  }

  openBlockModal(customer: GetCustomerResponseModel): void {
    this.selectedBlockCustomer = customer;
    const action = customer.status === 'Active' ? 'Block' : 'Unblock';
    this.blockConfig = {
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action.toLowerCase()} "${customer.name}"?`,
      cancelText: 'Cancel',
      confirmText: action,
    };
    this.isBlockModalOpen = true;
    this.activeDropdownId = null;
  }

  confirmBlock(): void {
    if (!this.selectedBlockCustomer) return;
    this.onToggleStatus(this.selectedBlockCustomer);
    this.closeBlockModal();
  }

  closeBlockModal(): void {
    this.isBlockModalOpen = false;
    this.blockConfig = null;
    this.selectedBlockCustomer = null;
  }

  openDeleteModal(customer: GetCustomerResponseModel): void {
    this.selectedCustomerId = customer.id;
    this.deleteConfig = createDeleteConfig(customer.name);
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.selectedCustomerId) return;

    this.customerManagementService
      .deleteCustomer(this.selectedCustomerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.closeDeleteModal();
            this.loadCustomers();
          }
        },
        error: (err) => this.toastr.error(err?.error?.message),
      });
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteConfig = null;
    this.selectedCustomerId = null;
  }

  closeModal(): void {
    this.showModal = false;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filter.pageNumber = page;
    this.loadCustomers();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.currentPage = 1;
    this.loadCustomers();
  }
  dropdownOpenUp = false;
  toggleDropdown(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeDropdownId === id) {
      this.activeDropdownId = null;
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    this.dropdownOpenUp = spaceBelow < 250;
    this.activeDropdownId = id;
  }

  isLastRows(index: number, total: number): boolean {
    return index >= total - 3;
  }

  closeDropdowns(): void {
    this.activeDropdownId = null;
  }
}