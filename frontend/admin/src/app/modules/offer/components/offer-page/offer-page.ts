import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button, ButtonInputConfig, DeleteModel, DeleteModelConfig, FilterPanel, FilterPanelConfig, FilterValues, PaginationComponent, createDeleteConfig, } from '@common';
import { DEFAULT_PAGINATION } from '@constants';
import { AppliedCountPipe, DiscountPipe } from '@pipe';
import { ToastrService } from 'ngx-toastr';
import { OfferService } from '@offerServices';
import { CreateOfferRequestModel, FilterOfferRequestModel, GetOfferResponseModel, UpdateOfferRequestModel } from '@offerModels';
import { OfferModal } from '../offer-modal/offer-modal';

@Component({
  selector: 'app-offer-page',
  standalone: true,
  templateUrl: './offer-page.html',
  styleUrl: './offer-page.css',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    OfferModal,
    DeleteModel,
    DiscountPipe,
    AppliedCountPipe,
    PaginationComponent,
    FilterPanel,
  ],
})
export class OfferPage implements OnInit {
  constructor(private offerService: OfferService, private toastr: ToastrService) {}

  offers: GetOfferResponseModel[] = [];

  isLoading = false;
  errorMessage = '';

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  activeFilter: FilterOfferRequestModel | null = null;

  filterPanelConfig: FilterPanelConfig = {
    fields: [
      {
        key: 'discountPercentage',
        label: 'Coupon Discount',
        type: 'text-with-suffix',
        suffix: '%',
        placeholder: 'Coupon Discount',
      },
      {
        key: 'appliedCount',
        label: 'Coupon Applied',
        type: 'number-range',
        min: 0,
        max: 0,
        step: 1,
      },
      {
        key: 'availability',
        label: 'Availability',
        type: 'toggle',
        defaultValue: true,
      },
    ],
    onFilter: (values: FilterValues) => this.applyFilter(values),
    onCancel: () => this.cancelFilter(),
  };

  sortField: string = 'couponCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  filterConfig: ButtonInputConfig = {
    variant: 'filter',
    type: 'button',
    onClick: () => this.onFilter(),
  };

  addConfig: ButtonInputConfig = {
    variant: 'add',
    type: 'button',
    onClick: () => this.onAdd(),
  };

  showModal = false;
  selectedOffer: GetOfferResponseModel | null = null;

  isDeleteModalOpen = false;
  deleteConfig: DeleteModelConfig | null = null;
  private entityToDelete: { id: number; couponCode: string } | null = null;

  currentPage: number = DEFAULT_PAGINATION.currentPage;
  itemsPerPage: number = DEFAULT_PAGINATION.itemsPerPage;
  totalItems: number = DEFAULT_PAGINATION.totalItems;
  pageSizeOptions: number[] = DEFAULT_PAGINATION.pageSizeOptions;

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: FilterOfferRequestModel = {
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      ...(this.activeFilter !== null ? this.activeFilter : {}),
    };

    this.offerService.getOffers(this.currentPage, this.itemsPerPage, filter).subscribe({

      next: (res) => {
        this.offers = res.data.records;
        this.totalItems = res.data.totalRecords;
        this.updateAppliedCountMax(res.data.filterMeta?.maxBookingCount ?? 0);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load offers';
        this.isLoading = false;
      },
    });
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadOffers();
  }

  onFilter(): void {
    this.isFilterOpen = true;
  }

  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    this.activeFilter = {
      discountPercentage: (values['discountPercentage'] as number) ?? null,
      appliedCountMin: (values['appliedCount_min'] as number) ?? null,
      appliedCountMax: (values['appliedCount_max'] as number) ?? null,
      availability: (values['availability'] as boolean) ?? null,
    };
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadOffers();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilter = null;
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.loadOffers();
  }

  private updateAppliedCountMax(max: number): void {
    const field = this.filterPanelConfig.fields.find((f) => f.key === 'appliedCount');
    if (field) field.max = max;
  }

  onAdd(): void {
    this.selectedOffer = null;
    this.showModal = true;
  }

  onEdit(offer: GetOfferResponseModel): void {
    this.selectedOffer = offer;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOffer = null;
  }

  saveOffer(data: CreateOfferRequestModel | UpdateOfferRequestModel): void {
    const api = 'id' in data && data.id
      ? this.offerService.updateOffer((data as UpdateOfferRequestModel).id, data as UpdateOfferRequestModel)
      : this.offerService.createOffer(data as CreateOfferRequestModel);

    api.subscribe({
      next: () => {
        this.toastr.success('id' in data && data.id ? 'Offer updated successfully' : 'Offer created successfully');
        this.loadOffers();
        this.closeModal();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
      },
    });
  }

  openDeleteModal(offer: GetOfferResponseModel): void {
    this.entityToDelete = { id: offer.id, couponCode: offer.couponCode };
    this.deleteConfig = createDeleteConfig(offer.couponCode);
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteConfig = null;
    this.entityToDelete = null;
  }

  confirmDelete(): void {
    if (!this.entityToDelete) return;

    this.offerService.deleteOffer(this.entityToDelete.id).subscribe({
      next: () => {
        this.toastr.success('Offer deleted successfully');
        this.closeDeleteModal();
        this.loadOffers();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message);
        this.closeDeleteModal();
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadOffers();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = +size;
    this.currentPage = 1;
    this.loadOffers();
  }
}