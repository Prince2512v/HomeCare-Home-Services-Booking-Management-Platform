import { OnInit, OnDestroy, Component, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Button,
  ButtonInputConfig,
  DeleteModel,
  DeleteModelConfig,
  FilterPanel,
  FilterPanelConfig,
  FilterOption,
  FilterValues,
  PaginationComponent,
  createDeleteConfig,
  CancelBookingModal,
  ChangeExpertModal,
  ConfirmationModel,
  ConfirmationModelConfig,
} from '@common';
import { DEFAULT_PAGINATION, BUTTON_LABEL } from '@constants';
import { ToastrService } from 'ngx-toastr';
import { MasterDataService } from '@masterDataServices';
import { BookingSignalRService } from '@services';
import { BookingService } from '../../services/booking.service';
import {
  BookingDetailResponse,
  FilterBookingRequestModel,
  ExpandedBookingRow,
  FilterRangeMeta,
} from '../../models';
import { MobileNumberPipe } from '@pipe';

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
  selector: 'app-booking-page',
  standalone: true,
  templateUrl: './booking-page.html',
  styleUrl: './booking-page.css',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    DeleteModel,
    PaginationComponent,
    FilterPanel,
    ChangeExpertModal,
    CancelBookingModal,
    ConfirmationModel,
    CurrencyPipe,
    MobileNumberPipe,
  ],
})
export class BookingPage implements OnInit, OnDestroy {
  constructor(
    private bookingService: BookingService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private bookingSignalR: BookingSignalRService,
    private router: Router
  ) {}

  // Sorting – Parent Grid
  sortField: string = 'customerName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Sorting – Child Grid (client-side per expanded row)
  childSortField: string = 'serviceId';
  childSortDirection: 'asc' | 'desc' = 'asc';

  // Grid Data
  rows: ExpandedBookingRow[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  // Filter
  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  activeFilter: FilterBookingRequestModel | null = null;

  private serviceTypeOptions: FilterOption[] = [];
  private serviceTypeIdMap = new Map<string, number>();
  private filterMeta: FilterRangeMeta = { maxAmount: null, maxBookedServices: null };

  // SignalR
  private signalRSub: Subscription | null = null;

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
        key: 'bookedServices',
        label: 'Booked Services',
        type: 'number-range',
        min: 0,
        max: 99,
        step: 1,
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

  openActionBookingId: number | null = null;
  actionMenuPosition: { top: number; left: number } | null = null;

  isDeleteCustomerOpen = false;
  deleteCustomerConfig: DeleteModelConfig | null = null;
  private pendingDeleteUserId: number | null = null;
  private pendingDeletePaymentMethod: string | null = null;

  isDeleteBookingOpen = false;
  deleteBookingConfig: DeleteModelConfig | null = null;
  private pendingDeleteBookingId: number | null = null;

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

  // Expert hover popup
  hoveredExpertBookingId: number | null = null;

  ngOnInit(): void {
    this.loadServiceTypeOptions();
    this.loadBookings();
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    this.signalRSub?.unsubscribe();
    this.bookingSignalR.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.openActionBookingId !== null) this.closeActionMenu();
  }

  // SignalR

  private connectSignalR(): void {
    this.bookingSignalR.connect();

    this.signalRSub = this.bookingSignalR.newBooking$.subscribe(({ userId, paymentMethod }) => {
      this.handleNewBookingEvent(userId, paymentMethod);
    });
  }

  private handleNewBookingEvent(userId: number, paymentMethod: string): void {
    if (
      this.activeFilter?.paymentMethod !== null &&
      this.activeFilter?.paymentMethod !== undefined &&
      this.activeFilter.paymentMethod.toLowerCase() !== paymentMethod.toLowerCase()
    ) {
      return;
    }

    const rowIndex = this.rows.findIndex(
      (r) => r.userId === userId && r.paymentMethod.toLowerCase() === paymentMethod.toLowerCase()
    );

    if (rowIndex !== -1) {
      this.refreshSingleRow(rowIndex, userId, paymentMethod);
    } else {
      this.loadBookings();
    }
  }

  private refreshSingleRow(rowIndex: number, userId: number, paymentMethod: string): void {
    this.bookingService.getCustomerBookingSummaries(this.buildFilterParams()).subscribe({
      next: (res) => {
        const updatedSummary = res.data.records.find(
          (s) =>
            s.userId === userId && s.paymentMethod.toLowerCase() === paymentMethod.toLowerCase()
        );

        if (updatedSummary) {
          const existingRow = this.rows[rowIndex];

          this.rows[rowIndex] = {
            ...existingRow,
            ...updatedSummary,
            isExpanded: existingRow.isExpanded,
            isLoadingDetails: existingRow.isLoadingDetails,
            details: existingRow.details,
            isDetailsDirty: true,
          };

          this.totalItems = res.data.totalRecords;
          this.applyFilterMeta(res.data.filterMeta);

          if (existingRow.isExpanded) {
            this.loadDetails(this.rows[rowIndex]);
          }
        } else {
          this.loadBookings();
        }
      },
      error: () => {
        this.loadBookings();
      },
    });
  }

  //Service Type Filter Options
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

  // Load Bookings

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getCustomerBookingSummaries(this.buildFilterParams()).subscribe({
      next: (res) => {
        const prevExpanded = new Map(
          this.rows.filter((r) => r.isExpanded).map((r) => [`${r.userId}_${r.paymentMethod}`, r])
        );
        this.rows = res.data.records.map((summary) => {
          const prev = prevExpanded.get(`${summary.userId}_${summary.paymentMethod}`);
          return {
            ...summary,
            isExpanded: prev?.isExpanded ?? false,
            isLoadingDetails: false,
            details: prev?.details ?? [],
            isDetailsDirty: prev?.isDetailsDirty ?? false,
          };
        });
        this.totalItems = res.data.totalRecords;
        this.applyFilterMeta(res.data.filterMeta);
        this.isLoading = false;

        this.rows.forEach((row) => {
          if (row.isExpanded) this.loadDetails(row);
        });
      },
    });
  }

  /** Parent grid: sort by server-side field */
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

  /** Child grid: sort client-side across all expanded rows */
  onChildSort(field: string): void {
    if (this.childSortField === field) {
      this.childSortDirection = this.childSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.childSortField = field;
      this.childSortDirection = 'asc';
    }
    this.rows.forEach((row) => {
      if (row.isExpanded && row.details.length > 0) {
        row.details = this.sortDetails(row.details);
      }
    });
  }

  private sortDetails(details: BookingDetailResponse[]): BookingDetailResponse[] {
    const dir = this.childSortDirection === 'asc' ? 1 : -1;
    return [...details].sort((a, b) => {
      if (this.childSortField === 'serviceId') {
        return (a.serviceId - b.serviceId) * dir;
      }
      if (this.childSortField === 'dateTime') {
        const aVal = `${a.bookingDate} ${a.bookingTime}`;
        const bVal = `${b.bookingDate} ${b.bookingTime}`;
        return aVal.localeCompare(bVal) * dir;
      }
      return 0;
    });
  }

  // Expand / Collapse Row

  toggleRow(row: ExpandedBookingRow): void {
    if (row.isExpanded) {
      row.isExpanded = false;
      return;
    }

    row.isExpanded = true;
    if (row.details.length === 0 || row.isDetailsDirty) {
      this.loadDetails(row);
    }
  }

  loadDetails(row: ExpandedBookingRow): void {
    row.isLoadingDetails = true;
    const params = { ...this.buildFilterParams(), paymentMethod: row.paymentMethod };
    this.bookingService.getBookingDetailsByUserId(row.userId, params).subscribe({
      next: (res) => {
        const mapped = res.data.map((detail) => ({
          ...detail,
          assignedExpertImageUrl: detail.assignedExpertImageUrl
            ? `${environment.resourceUrl}/resources/ServicePartner/${detail.assignedExpertImageUrl}`
            : null,
        }));
        row.details = this.sortDetails(mapped);
        row.isLoadingDetails = false;
        row.isDetailsDirty = false;
      },
      error: () => {
        row.isLoadingDetails = false;
      },
    });
  }

  // Action Dropdown
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

  getOpenDetail(): BookingDetailResponse | undefined {
    if (this.openActionBookingId === null) return undefined;
    for (const row of this.rows) {
      const found = row.details.find((d) => d.bookingId === this.openActionBookingId);
      if (found) return found;
    }
    return undefined;
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

  // Change Expert

  openChangeExpert(detail: BookingDetailResponse, event: Event): void {
    event.stopPropagation();
    this.closeActionMenu();
    this.changeExpertBookingId = detail.bookingId;
    this.changeExpertServiceType = detail.serviceType;
    this.changeExpertServiceTypeId = this.resolveServiceTypeId(detail.serviceType);
    this.changeExpertCurrentName = detail.assignedExpertName;
    this.changeExpertCurrentImageUrl = detail.assignedExpertImageUrl ?? null;
    this.showChangeExpertModal = true;
  }

  onExpertChanged(res: any): void {
    this.showChangeExpertModal = false;
    this.toastr.success(res?.message);
    this.rows.forEach((row) => {
      if (row.isExpanded) this.loadDetails(row);
    });
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
      cancelText: BUTTON_LABEL.CANCEL,
      confirmText: BUTTON_LABEL.CONFIRM,
    };
    this.isCompleteConfirmOpen = true;
  }

  confirmCompleteBooking(): void {
    if (!this.pendingCompleteBookingId) return;
    this.bookingService.completeBooking(this.pendingCompleteBookingId).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message);
        this.closeCompleteConfirm();
        this.refreshParentAndDetails();
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
    this.refreshParentAndDetails();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  // Delete Booking (child grid)

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
        this.refreshParentAndDetails();
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

  // Delete Bookings by Payment (parent grid)

  openDeleteCustomer(
    userId: number,
    customerName: string,
    paymentMethod: string,
    event: Event
  ): void {
    event.stopPropagation();
    this.pendingDeleteUserId = userId;
    this.pendingDeletePaymentMethod = paymentMethod;
    this.deleteCustomerConfig = createDeleteConfig(`${paymentMethod} bookings for ${customerName}`);
    this.isDeleteCustomerOpen = true;
  }

  confirmDeleteCustomer(): void {
    if (!this.pendingDeleteUserId || !this.pendingDeletePaymentMethod) return;
    this.bookingService
      .deleteBookingsByPayment(this.pendingDeleteUserId, this.pendingDeletePaymentMethod)
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res?.message);
          this.closeDeleteCustomerModal();
          this.loadBookings();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message);
          this.closeDeleteCustomerModal();
        },
      });
  }

  closeDeleteCustomerModal(): void {
    this.isDeleteCustomerOpen = false;
    this.deleteCustomerConfig = null;
    this.pendingDeleteUserId = null;
    this.pendingDeletePaymentMethod = null;
  }

  // Filter

  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    this.activeFilter = {
      serviceTypeId: (values['serviceTypeId'] as number) || null,
      date: (values['date'] as string) || null,
      time: (values['time'] as string) || null,
      bookedServicesMin: (values['bookedServices_min'] as number) ?? null,
      bookedServicesMax: (values['bookedServices_max'] as number) ?? null,
      amountMin: (values['amount_min'] as number) ?? null,
      amountMax: (values['amount_max'] as number) ?? null,
      paymentMethod: (values['paymentMethod'] as string) || null,
      status: (values['status'] as string) || null,
    };
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.rows.forEach((r) => (r.details = []));
    this.loadBookings();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilter = null;
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.rows.forEach((r) => (r.details = []));
    this.loadBookings();
  }

  // Pagination

  changePage(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }
  changePageSize(size: number): void {
    this.itemsPerPage = +size;
    this.currentPage = 1;
    this.loadBookings();
  }

  // Helpers

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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

  formatDateTime(date: string, time: string): string {
    try {
      const d = new Date(date);
      return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}, ${time}`;
    } catch {
      return `${date}, ${time}`;
    }
  }

  private buildFilterParams(): Record<string, string> {
    const params: Record<string, string> = {
      pageNumber: String(this.currentPage),
      pageSize: String(this.itemsPerPage),
      sortField: this.sortField,
      sortDirection: this.sortDirection,
    };

    const filter = this.activeFilter;
    if (filter) {
      if (filter.serviceTypeId !== null && filter.serviceTypeId !== undefined)
        params['serviceTypeId'] = String(filter.serviceTypeId);
      if (filter.date !== null && filter.date !== undefined) params['date'] = filter.date;
      if (filter.time !== null && filter.time !== undefined) params['time'] = filter.time;
      if (filter.bookedServicesMin !== null && filter.bookedServicesMin !== undefined)
        params['bookedServicesMin'] = String(filter.bookedServicesMin);
      if (filter.bookedServicesMax !== null && filter.bookedServicesMax !== undefined)
        params['bookedServicesMax'] = String(filter.bookedServicesMax);
      if (filter.amountMin !== null && filter.amountMin !== undefined)
        params['amountMin'] = String(filter.amountMin);
      if (filter.amountMax !== null && filter.amountMax !== undefined)
        params['amountMax'] = String(filter.amountMax);
      if (filter.paymentMethod !== null && filter.paymentMethod !== undefined)
        params['paymentMethod'] = filter.paymentMethod;
      if (filter.status !== null && filter.status !== undefined) params['status'] = filter.status;
    }

    return params;
  }

  private applyFilterMeta(meta: FilterRangeMeta): void {
    if (!meta) return;
    this.filterMeta = meta;
    this.filterPanelConfig = {
      ...this.filterPanelConfig,
      fields: this.filterPanelConfig.fields.map((f) => {
        if (f.key === 'bookedServices' && meta.maxBookedServices !== null)
          return { ...f, max: meta.maxBookedServices };
        if (f.key === 'amount' && meta.maxAmount !== null)
          return { ...f, max: Math.ceil(meta.maxAmount) };
        return f;
      }),
    };
  }

  private resolveServiceTypeId(serviceType: string): number {
    return this.serviceTypeIdMap.get(serviceType) ?? 0;
  }

  private refreshParentAndDetails(): void {
    this.bookingService.getCustomerBookingSummaries(this.buildFilterParams()).subscribe({
      next: (res) => {
        const prevExpanded = new Map(
          this.rows.filter((r) => r.isExpanded).map((r) => [`${r.userId}_${r.paymentMethod}`, r])
        );
        this.rows = res.data.records.map((summary) => {
          const prev = prevExpanded.get(`${summary.userId}_${summary.paymentMethod}`);
          return {
            ...summary,
            isExpanded: prev?.isExpanded ?? false,
            isLoadingDetails: false,
            details: prev?.details ?? [],
            isDetailsDirty: prev?.isDetailsDirty ?? false,
          };
        });
        this.totalItems = res.data.totalRecords;
        this.applyFilterMeta(res.data.filterMeta);
        this.rows.forEach((row) => {
          if (row.isExpanded) this.loadDetails(row);
        });
      },
    });
  }
}