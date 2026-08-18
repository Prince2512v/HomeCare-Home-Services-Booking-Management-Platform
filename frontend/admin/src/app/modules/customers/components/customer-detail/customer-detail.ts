import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Button, ButtonInputConfig, DeleteModel, DeleteModelConfig, createDeleteConfig, FilterPanel, FilterPanelConfig, FilterOption, FilterValues, PaginationComponent, ConfirmationModel, ConfirmationModelConfig, CancelBookingModal, ChangeExpertModal } from '@common';
import { CustomerManagementService } from '@customerManagementServices';
import {
  CustomerDetailResponse,
  CustomerBookingDetailResponse,
  FilterCustomerBookingsRequestModel,
} from '@customerManagementModels';
import { BookingService } from 'src/app/modules/booking-management/services/booking.service';
import { MasterDataService } from '@masterDataServices';
import { environment } from 'src/environments/environment';
import { IdFormat, MobileNumberPipe } from '@pipe';

const PAYMENT_METHOD_OPTIONS: FilterOption[] = [
  { value: 'Card', label: 'Card' },
  { value: 'Cash', label: 'Cash' },
];

const BOOKING_STATUS_OPTIONS: FilterOption[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const BOOKING_TIME_OPTIONS: FilterOption[] = [
  { value: '09:00', label: '09:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '18:00', label: '06:00 PM' },
];

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    PaginationComponent,
    DeleteModel,
    ConfirmationModel,
    FilterPanel,
    CancelBookingModal,
    ChangeExpertModal,
    CurrencyPipe,
    IdFormat,
    MobileNumberPipe
  ],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.css',
})
export class CustomerDetail implements OnInit {
  customer: CustomerDetailResponse | null = null;
  bookings: CustomerBookingDetailResponse[] = [];
  isLoadingCustomer = false;
  isLoadingBookings = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Sorting
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filter
  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  activeFilter: FilterCustomerBookingsRequestModel = { pageNumber: 1, pageSize: 10 };
  private serviceTypeIdMap = new Map<string, number>();

  // Action menu
  openActionBookingId: number | null = null;
  actionMenuPosition: { top: number; left: number } | null = null;

  // Expert hover popup
  hoveredExpertBookingId: number | null = null;

  // Modals
  showChangeExpertModal = false;
  changeExpertBookingId: number | null = null;
  changeExpertServiceType = '';
  changeExpertServiceTypeId = 0;
  changeExpertCurrentName: string | null = null;
  changeExpertCurrentImageUrl: string | null = null;

  showCancelModal = false;
  cancelBookingId: number | null = null;

  isCompleteConfirmOpen = false;
  completeConfirmConfig: ConfirmationModelConfig | null = null;
  private pendingCompleteBookingId: number | null = null;

  isDeleteBookingOpen = false;
  deleteBookingConfig: DeleteModelConfig | null = null;
  private pendingDeleteBookingId: number | null = null;

  filterConfig: ButtonInputConfig = {
    variant: 'filter',
    type: 'button',
    onClick: () => (this.isFilterOpen = true),
  };

  filterPanelConfig: FilterPanelConfig = {
    fields: [
      {
        key: 'serviceTypeId',
        label: 'Service Type',
        type: 'select',
        options: [],
        placeholder: 'All Service Types',
      },
      { key: 'date', label: 'Date', type: 'date', placeholder: 'Date' },
      {
        key: 'time',
        label: 'Time',
        type: 'select',
        options: BOOKING_TIME_OPTIONS,
        placeholder: 'Times',
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'price-range',
        min: 0,
        max: 99999,
        step: 1,
      },
      {
        key: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        options: PAYMENT_METHOD_OPTIONS,
        placeholder: 'Payment Method',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: BOOKING_STATUS_OPTIONS,
        placeholder: 'Status',
      },
    ],
    onFilter: (values: FilterValues) => this.applyFilter(values),
    onCancel: () => this.cancelFilter(),
  };

  private customerId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerManagementService,
    private bookingService: BookingService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCustomerDetail();
    this.loadBookings();
    this.loadServiceTypeOptions();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.openActionBookingId !== null) this.closeActionMenu();
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/user-management/customers']);
  }

  // Load Data
  private loadCustomerDetail(): void {
    this.isLoadingCustomer = true;
    this.customerService.getCustomerDetail(this.customerId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.customer = res.data;
        this.isLoadingCustomer = false;
      },
      error: () => {
        this.isLoadingCustomer = false;
      },
    });
  }

  loadBookings(): void {
    this.isLoadingBookings = true;
    const filter: FilterCustomerBookingsRequestModel = {
      ...this.activeFilter,
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
      ...(this.sortField ? { sortField: this.sortField, sortDirection: this.sortDirection } : {}),
    };

    this.customerService.getCustomerBookings(this.customerId, filter).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.bookings = res.data.records.map((b) => ({
            ...b,
            assignedExpertImageUrl: b.assignedExpertImageUrl
              ? `${environment.resourceUrl}/resources/ServicePartner/${b.assignedExpertImageUrl}`
              : null,
          }));
          this.totalItems = res.data.totalRecords;
          const maxAmount = res.data.filterMeta?.maxAmount;
          if (maxAmount !== null && maxAmount !== undefined) {
            this.filterPanelConfig = {
              ...this.filterPanelConfig,
              fields: this.filterPanelConfig.fields.map((f) =>
                f.key === 'amount' ? { ...f, max: Math.ceil(maxAmount) } : f
              ),
            };
          }
        }
        this.isLoadingBookings = false;
      },
      error: () => {
        this.isLoadingBookings = false;
      },
    });
  }

  private loadServiceTypeOptions(): void {
    this.masterDataService.getServiceTypes().subscribe({
      next: (res) => {
        const types = res?.data?.records ?? [];
        const options: FilterOption[] = types.map((t) => ({
          value: t.id,
          label: t.serviceName ?? String(t.id),
        }));

        this.serviceTypeIdMap.clear();
        types.forEach((t) => {
          if (t.serviceName) this.serviceTypeIdMap.set(t.serviceName, t.id);
        });

        this.filterPanelConfig = {
          ...this.filterPanelConfig,
          fields: this.filterPanelConfig.fields.map((f) =>
            f.key === 'serviceTypeId' ? { ...f, options } : f
          ),
        };
      },
    });
  }

  // Sorting
  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadBookings();
  }

  // Pagination
  changePage(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadBookings();
  }

  // Filter
  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    this.activeFilter = {
      pageNumber: 1,
      pageSize: this.itemsPerPage,
      serviceTypeId: (values['serviceTypeId'] as number) || null,
      date: (values['date'] as string) || null,
      time: (values['time'] as string) || null,
      amountMin:
        typeof values['amount_min'] === 'number' && isFinite(values['amount_min'] as number)
          ? (values['amount_min'] as number)
          : null,
      amountMax:
        typeof values['amount_max'] === 'number' && isFinite(values['amount_max'] as number)
          ? (values['amount_max'] as number)
          : null,
      paymentMethod: (values['paymentMethod'] as string) || null,
      status: (values['status'] as string) || null,
    };
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadBookings();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilter = { pageNumber: 1, pageSize: this.itemsPerPage };
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.loadBookings();
  }

  // Action Menu
  toggleActionMenu(bookingId: number, event: Event, triggerEl: HTMLElement): void {
    event.stopPropagation();

    if (this.openActionBookingId === bookingId) {
      this.closeActionMenu();
      return;
    }

    this.openActionBookingId = bookingId;

    const rect = triggerEl.getBoundingClientRect();
    const menuHeight = 180;
    const menuWidth = 200;

    let top = rect.bottom + 4;
    const left = rect.right - menuWidth;

    if (rect.bottom + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }

    this.actionMenuPosition = {
      top,
      left: left < 8 ? 8 : left,
    };
  }

  closeActionMenu(): void {
    this.openActionBookingId = null;
    this.actionMenuPosition = null;
  }

  getOpenBooking(): CustomerBookingDetailResponse | undefined {
    if (this.openActionBookingId === null) return undefined;
    return this.bookings.find((b) => b.bookingId === this.openActionBookingId);
  }

  // Expert Hover Popup
  showExpertPopup(bookingId: number): void {
    this.hoveredExpertBookingId = bookingId;
  }

  hideExpertPopup(): void {
    this.hoveredExpertBookingId = null;
  }

  navigateToExpertDetail(partnerId: number | null, event: Event): void {
    event.stopPropagation();
    if (partnerId) {
      this.router.navigate(['/user-management/service-partners', partnerId]);
    }
  }

  // Change / Assign Expert
  openChangeExpert(booking: CustomerBookingDetailResponse, event: Event): void {
    event.stopPropagation();
    this.closeActionMenu();
    this.changeExpertBookingId = booking.bookingId;
    this.changeExpertServiceType = booking.serviceType;
    this.changeExpertServiceTypeId =
      booking.serviceTypeId ?? this.resolveServiceTypeId(booking.serviceType);
    this.changeExpertCurrentName = booking.assignedExpertName;
    this.changeExpertCurrentImageUrl = booking.assignedExpertImageUrl ?? null;
    this.showChangeExpertModal = true;
  }

  onExpertChanged(res: any): void {
    this.showChangeExpertModal = false;
    this.toastr.success(res?.message);
    this.loadBookings();
  }

  closeChangeExpertModal(): void {
    this.showChangeExpertModal = false;
  }

  // Complete Booking
  openCompleteBooking(bookingId: number, event: Event): void {
    event.stopPropagation();
    this.closeActionMenu();
    this.pendingCompleteBookingId = bookingId;
    this.completeConfirmConfig = {
      title: 'Complete Booking',
      message: 'Are you sure you want to complete this booking?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
    };
    this.isCompleteConfirmOpen = true;
  }

  confirmCompleteBooking(): void {
    if (!this.pendingCompleteBookingId) return;
    this.bookingService.completeBooking(this.pendingCompleteBookingId).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message);
        this.closeCompleteConfirm();
        this.loadBookings();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.closeCompleteConfirm();
      },
    });
  }

  closeCompleteConfirm(): void {
    this.isCompleteConfirmOpen = false;
    this.completeConfirmConfig = null;
    this.pendingCompleteBookingId = null;
  }

  // Cancel Booking
  openCancelBooking(bookingId: number, event: Event): void {
    event.stopPropagation();
    this.closeActionMenu();
    this.cancelBookingId = bookingId;
    this.showCancelModal = true;
  }

  onBookingCancelled(res: any): void {
    this.showCancelModal = false;
    this.toastr.success(res?.message);
    this.loadBookings();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelBookingId = null;
  }

  // Delete Booking
  openDeleteBooking(bookingId: number, event: Event): void {
    event.stopPropagation();
    this.closeActionMenu();
    this.pendingDeleteBookingId = bookingId;
    this.deleteBookingConfig = createDeleteConfig('this booking');
    this.isDeleteBookingOpen = true;
  }

  confirmDeleteBooking(): void {
    if (!this.pendingDeleteBookingId) return;
    this.bookingService.deleteBooking(this.pendingDeleteBookingId).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message);
        this.closeDeleteBookingModal();
        this.loadBookings();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.closeDeleteBookingModal();
      },
    });
  }

  closeDeleteBookingModal(): void {
    this.isDeleteBookingOpen = false;
    this.deleteBookingConfig = null;
    this.pendingDeleteBookingId = null;
  }

  // Helpers
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getCustomerStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'customer-status-active';
      case 'inactive':
        return 'customer-status-inactive';
      case 'blocked':
      case 'block':
        return 'customer-status-blocked';
      default:
        return '';
    }
  }

  formatDateTime(date: string, time: string): string {
    try {
      const d = new Date(date);
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month} ${year} ${time}`;
    } catch {
      return `${date} ${time}`;
    }
  }

  private resolveServiceTypeId(serviceType: string): number {
    return this.serviceTypeIdMap.get(serviceType) ?? 0;
  }
}