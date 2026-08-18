import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Button,
  ButtonInputConfig,
  FilterPanel,
  FilterPanelConfig,
  FilterValues,
  ConfirmationModel,
  ConfirmationModelConfig,
  PaginationComponent,
} from '@common';
import { DEFAULT_PAGINATION, ROUTES } from '@constants';
import { IdFormat, MobileNumberPipe } from '@pipe';
import { ServicePartnerService } from '@servicepartnerServices';
import {
  ServicePartnerDetailResponse,
  AssignedServiceResponse,
  FilterAssignedServicesRequestModel,
} from '@servicepartnerModels';

@Component({
  selector: 'app-service-partner-detail',
  standalone: true,
  templateUrl: './service-partner-details.html',
  styleUrl: './service-partner-details.css',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    FilterPanel,
    IdFormat,
    MobileNumberPipe,
    ConfirmationModel,
    PaginationComponent,
  ],
})
export class ServicePartnerDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ServicePartnerService);
  private toastr = inject(ToastrService);

  partnerId!: number;
  partner: ServicePartnerDetailResponse | null = null;
  isLoading = true;

  assignedServices: AssignedServiceResponse[] = [];
  isServicesLoading = false;
  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;
  sortField = 'bookingDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  activeFilters: Pick<FilterAssignedServicesRequestModel, 'date' | 'time' | 'serviceStatus'> = {};
  activeFilterValues: FilterValues | null = null;
  isFilterOpen = false;

  filterButtonConfig: ButtonInputConfig = {
    variant: 'filter',
    onClick: () => (this.isFilterOpen = true),
  };

  filterPanelConfig!: FilterPanelConfig;

  isConfirmModalOpen = false;
  confirmConfig: ConfirmationModelConfig | null = null;
  pendingAction: (() => void) | null = null;

  isRejectModalOpen = false;
  rejectReason = '';

  ngOnInit(): void {
    this.partnerId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildFilterConfig();
    this.loadDetail();
  }

  loadDetail(): void {
    this.isLoading = true;
    this.svc.getServicePartnerDetail(this.partnerId).subscribe({
      next: (res) => {
        this.partner = res.data ?? null;
        this.isLoading = false;
        if (this.partner?.verificationStatus === 'Verified') {
          this.loadAssignedServices();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error?.message || 'An error occurred while fetching details.');
      },
    });
  }

  loadAssignedServices(): void {
    this.isServicesLoading = true;
    const filter: FilterAssignedServicesRequestModel = {
      ...this.activeFilters,
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
    };
    this.svc.getAssignedServices(this.partnerId, filter).subscribe({
      next: (res) => {
        this.assignedServices = this.sortRecords(res.data.records);
        this.totalItems = res.data.totalRecords;
        this.isServicesLoading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Unable to load services.');
        this.isServicesLoading = false;
      },
    });
  }

  onApprove(): void {
    this.confirmConfig = {
      title: 'Approve Service Partner',
      message: `Are you sure you want to approve ${this.partner?.fullName}? This will verify and activate their account.`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
    };
    this.pendingAction = () => {
      this.svc.approveServicePartner(this.partnerId).subscribe({
        next: (res) => {
          this.toastr.success(res.message || res.data?.message);
          this.loadDetail();
        },
        error: (err) => this.toastr.error(err.error?.message),
      });
    };
    this.isConfirmModalOpen = true;
  }

  onReject(): void {
    this.rejectReason = '';
    this.isRejectModalOpen = true;
  }

  confirmReject(): void {
    this.isRejectModalOpen = false;
    this.svc.rejectServicePartner(this.partnerId, this.rejectReason).subscribe({
      next: (res) => {
        this.toastr.success(res.message || res.data?.message);
        this.loadDetail();
      },
      error: (err) => this.toastr.error(err.error?.message),
    });
  }

  cancelReject(): void {
    this.isRejectModalOpen = false;
    this.rejectReason = '';
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.isConfirmModalOpen = false;
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.assignedServices = this.sortRecords(this.assignedServices);
  }

  private sortRecords(records: AssignedServiceResponse[]): AssignedServiceResponse[] {
    if (!records?.length) return records;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    return [...records].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (this.sortField) {
        case 'customerName':
          aVal = (a.customerName ?? '').toLowerCase();
          bVal = (b.customerName ?? '').toLowerCase();
          break;
        case 'serviceName':
          aVal = (a.serviceName ?? '').toLowerCase();
          bVal = (b.serviceName ?? '').toLowerCase();
          break;
        case 'bookingDate':
          aVal = a.dateAndTime ?? '';
          bVal = b.dateAndTime ?? '';
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '';
    return this.sortDirection === 'asc' ? '' : '';
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadAssignedServices();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadAssignedServices();
  }

  private buildFilterConfig(): void {
    this.filterPanelConfig = {
      title: 'Filter',
      fields: [
        { key: 'date', label: 'Date', type: 'date' },
        {
          key: 'time',
          label: 'Time',
          type: 'select',
          placeholder: 'Time',
          options: [
            { value: '9:00', label: '9:00 AM' },
            { value: '12:00', label: '12:00 AM' },
            { value: '15:00', label: '3:00 PM' },
            { value: '18:00', label: '6:00 PM' },
          ],
        },
        {
          key: 'serviceStatus',
          label: 'Status',
          type: 'select',
          placeholder: 'Status',
          options: [
            { value: 'Pending', label: 'Pending' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ],
        },
      ],
      onFilter: (values: FilterValues) => this.applyFilter(values),
      onCancel: () => this.cancelFilter(),
    };
  }

  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    const f: typeof this.activeFilters = {};

    if (values['date']) f.date = String(values['date']);
    if (values['time']) f.time = String(values['time']);
    if (values['serviceStatus']) f.serviceStatus = String(values['serviceStatus']);

    this.activeFilters = f;
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadAssignedServices();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilters = {};
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.loadAssignedServices();
  }

  isFilterActive(): boolean {
    return Object.values(this.activeFilters).some((v) => v !== null && v !== undefined && v !== '');
  }
  private readonly GENERIC_LABELS = new Set(['document', 'file', 'attachment']);
  getDocumentName(doc: { documentLabel?: string | null; fileName: string }): string {
    const label = doc.documentLabel?.trim();
    if (label && !this.GENERIC_LABELS.has(label.toLowerCase())) {
      return label;
    }
    if (doc.fileName) {
      const base = doc.fileName.split(/[/\\]/).pop() ?? doc.fileName;
      const underscoreIdx = base.indexOf('_');
      if (underscoreIdx > 0 && underscoreIdx < base.length - 1) {
        const afterUnderscore = base.slice(underscoreIdx + 1);
        if (!/^[0-9a-f]{8}-/i.test(afterUnderscore)) {
          return afterUnderscore;
        }
      }
      return base;
    }
    return 'Document';
  }
  downloadDocument(attachmentId: number, fileName: string): void {
    this.svc.downloadAttachment(this.partnerId, attachmentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      },
      error: (err) => {
        if (err.error instanceof Blob) {
          err.error.text().then((text: string) => {
            try {
              const parsed = JSON.parse(text);
              this.toastr.error(parsed.message );
            } catch {
              this.toastr.error('Download failed.');
            }
          });
        } else {
          this.toastr.error(err.error?.message);
        }
      },
    });
  }
  goBack(): void {
    this.router.navigate([ROUTES.USER_MANAGEMENT.SERVICE_PARTNERS.SERVICE_PARTNERS_ABSOLUTE]);
  }
  canApproveOrReject(): boolean {
    return this.partner?.verificationStatus === 'Unverified' && this.partner?.status !== 'Rejected';
  }
}