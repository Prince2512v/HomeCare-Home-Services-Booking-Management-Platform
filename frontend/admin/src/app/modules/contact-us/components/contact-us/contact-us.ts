import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button, ButtonInputConfig, FilterPanel, FilterPanelConfig, FilterValues, PaginationComponent } from '@common';
import { DEFAULT_PAGINATION } from '@constants';
import { ContactUsService } from '@contactUsServices';
import { GetContactUsResponseModel, FilterContactUsRequestModel } from '@contactUsModels';
import { IdFormat } from '@pipe';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    PaginationComponent,
    FilterPanel,
    IdFormat
  ],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs implements OnInit {
  constructor(private contactUsService: ContactUsService) { }
  tickets: GetContactUsResponseModel[] = [];

  isLoading = false;
  errorMessage = '';

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  activeFilter?: FilterContactUsRequestModel;
  filterPanelConfig: FilterPanelConfig = {
    fields: [
      {
        key: 'userName',
        label: 'User Name',
        type: 'text',
        placeholder: 'User Name',
      },
      {
        key: 'submittedAt',
        label: 'Submission Date',
        type: 'date',
        placeholder: 'Submission Date',
        icon: 'assets/images/admin/CalendarDots.svg',
      },
    ],
    onFilter: (values: FilterValues) => this.applyFilter(values),
    onCancel: () => this.cancelFilter(),
  };

  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  filterConfig: ButtonInputConfig = {
    variant: 'filter',
    type: 'button',
    onClick: () => this.onFilter(),
  };

  currentPage: number = DEFAULT_PAGINATION.currentPage;
  itemsPerPage: number = DEFAULT_PAGINATION.itemsPerPage;
  totalItems: number = DEFAULT_PAGINATION.totalItems;
  pageSizeOptions: number[] = DEFAULT_PAGINATION.pageSizeOptions;

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactUsService.getContactUs(
      this.currentPage,
      this.itemsPerPage,
      this.activeFilter,
      this.sortField,
      this.sortDirection)
      .subscribe({
        next: (res) => {
          this.tickets = res.data.records;
          this.totalItems = res.data.totalRecords;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message;
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
    this.loadTickets();
  }

  onFilter(): void {
    this.isFilterOpen = true;
  }

  applyFilter(values: FilterValues): void {
    this.activeFilterValues = { ...values };
    this.activeFilter = {
      userName: (values['userName'] as string) || null,
      submittedAt: (values['submittedAt'] as string) || null,
    };
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadTickets();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilter = undefined;
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.loadTickets();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadTickets();
  }

  changePageSize(size: number): void {
    this.itemsPerPage = +size;
    this.currentPage = 1;
    this.loadTickets();
  }
}