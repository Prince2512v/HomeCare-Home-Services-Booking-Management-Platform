import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ApiResponse } from '@models';
import {
  Button,
  ButtonInputConfig,
  ServiceTypeModal,
  AddcategoryModel,
  DeleteModel,
  DeleteModelConfig,
  createDeleteConfig,
  FilterPanel,
  FilterPanelConfig,
  FilterValues,
} from '@common';
import { ROUTES } from '@constants';
import { MasterDataService } from '@masterDataServices';
import { ToastrService } from 'ngx-toastr';
import { IdFormat, PendingSubFilterPipe } from '@pipe';
import {
  GetServiceTypeResponseModel,
  GetCategoryResponseModel,
  GetSubCategoryResponseModel,
  GetServicesListResponseModel,
  FilterServicesRequestModel,
  CreateCategoryRequestModel,
  CreateSubCategoryRequestModel,
  DataQueryResponseModel,
  FilteredDataQueryResponseModel,
} from '../../models/service-management.model';
import { ServiceManagementService } from '../../services/service-management.service';
import { AddServiceModal } from '../add-service-modal/add-service-modal';

interface ServiceFilterValues {
  subCategoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isAvailable?: boolean | null;
  commission?: number | null;
}

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    ServiceTypeModal,
    AddcategoryModel,
    DeleteModel,
    PendingSubFilterPipe,
    CurrencyPipe,
    FilterPanel,
    AddServiceModal,
    IdFormat,
  ],
  templateUrl: './service-management.html',
  styleUrl: './service-management.css',
})
export class ServiceManagement implements OnInit {
  //  Service Types
  serviceTypes: GetServiceTypeResponseModel[] = [];
  isAddModalOpen = false;

  addConfig: ButtonInputConfig = {
    variant: 'add',
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      this.isAddModalOpen = true;
    },
  };

  //  Accordion state
  expandedIds: Set<number> = new Set();
  categoriesMap: Map<number, GetCategoryResponseModel[]> = new Map();
  selectedCategoryMap: Map<number, number> = new Map();
  subCategoriesMap: Map<number, GetSubCategoryResponseModel[]> = new Map();
  servicesMap: Map<number, GetServicesListResponseModel[]> = new Map();

  //  Filter state
  openFilterServiceTypeId: number | null = null;
  activeFiltersMap: Map<number, ServiceFilterValues> = new Map();
  private maxPricePerSubCategory: Map<number, number> = new Map();

  //  Add Service Modal
  isAddServiceModalOpen = false;
  addServiceServiceTypeId: number | null = null;
  addServiceCategoryId: number | null = null;

  //  Action dropdown
  activeDropdownServiceId: number | null = null;

  //  Edit / Delete service
  editServiceId: number | null = null;
  isEditServiceModalOpen = false;
  isDeleteServiceModalOpen = false;
  deleteServiceConfig: any = null;
  private serviceToDelete: { id: number; name: string } | null = null;

  //  Manage Category Modal
  isModalOpen = false;
  serviceTypeName = '';
  serviceTypeId!: number;

  categories: GetCategoryResponseModel[] = [];
  subCategories: GetSubCategoryResponseModel[] = [];

  pendingCategories: { tempId: string; categoryName: string }[] = [];
  pendingSubCategories: {
    tempId: string;
    subCategoryName: string;
    categoryTempId?: string;
    categoryId?: number;
  }[] = [];
  pendingDeletedCategories: number[] = [];
  pendingDeletedSubCategories: number[] = [];

  isAddCategoryModalOpen = false;
  isAddSubCategoryModalOpen = false;
  existingCategoryNames: string[] = [];
  existingSubCategoryNames: string[] = [];

  selectedCategoryIdForSub: number | null = null;
  selectedCategoryTempIdForSub: string | null = null;

  deleteModalVisible = false;
  deleteSubCategoryModalVisible = false;
  deleteConfig: DeleteModelConfig | null = null;
  deleteSubCategoryConfig!: DeleteModelConfig;
  selectedDeleteCategoryId!: number;
  selectedDeleteSubCategoryId!: number;

  cancelButtonConfig: ButtonInputConfig = { variant: 'close', onClick: () => this.closeModal() };
  saveButtonConfig: ButtonInputConfig = { variant: 'save', onClick: () => this.saveAllToDb() };

  constructor(
    private svc: ServiceManagementService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServiceTypes();
  }

  goBack(): void {
    this.router.navigate([ROUTES.SERVICE_MANAGEMENT.SERVICE_MANAGEMENT_ABSOLUTE]);
  }

  //  Service Types
  loadServiceTypes(): void {
    this.svc.getServiceTypes().subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetServiceTypeResponseModel>>) => {
        this.serviceTypes = res?.data?.records ?? [];
      },
    });
  }

  handleSave(): void {
    this.isAddModalOpen = false;
    this.loadServiceTypes();
  }

  //  Accordion
  toggleExpand(serviceTypeId: number): void {
    if (this.expandedIds.has(serviceTypeId)) {
      this.expandedIds.delete(serviceTypeId);
    } else {
      this.expandedIds.add(serviceTypeId);
      if (!this.categoriesMap.has(serviceTypeId)) {
        this.loadAllDataForServiceType(serviceTypeId);
      }
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  loadAllDataForServiceType(serviceTypeId: number): void {
    this.svc.getFullDataByServiceType(serviceTypeId).subscribe({
      next: (res) => {
        const categories = res?.data?.categories ?? [];

        this.categoriesMap.set(
          serviceTypeId,
          categories.map((c) => ({
            id: c.id,
            categoryName: c.categoryName,
            serviceTypeId,
            serviceTypeName: '',
          }))
        );

        if (categories.length > 0 && !this.selectedCategoryMap.has(serviceTypeId)) {
          this.selectedCategoryMap.set(serviceTypeId, categories[0].id);
        }

        categories.forEach((cat) => {
          this.subCategoriesMap.set(
            cat.id,
            cat.subCategories.map((s) => ({
              id: s.id,
              subCategoryName: s.subCategoryName,
              categoryId: cat.id,
            }))
          );
          cat.subCategories.forEach((sub) => {
            this.servicesMap.set(sub.id, sub.services);
            const max = sub.services.reduce((m, s) => (s.price > m ? s.price : m), 0);
            if (max > 0) this.maxPricePerSubCategory.set(sub.id, Math.ceil(max));
          });
        });
      },
    });
  }

  getCategories(serviceTypeId: number): GetCategoryResponseModel[] {
    return this.categoriesMap.get(serviceTypeId) ?? [];
  }

  selectCategoryCard(serviceTypeId: number, categoryId: number): void {
    this.selectedCategoryMap.set(serviceTypeId, categoryId);
  }

  isSelectedCategory(serviceTypeId: number, categoryId: number): boolean {
    return this.selectedCategoryMap.get(serviceTypeId) === categoryId;
  }

  getSelectedCategoryName(serviceTypeId: number): string {
    const catId = this.selectedCategoryMap.get(serviceTypeId);
    return this.categoriesMap.get(serviceTypeId)?.find((c) => c.id === catId)?.categoryName ?? '';
  }

  loadSubCategoriesForAccordion(categoryId: number): void {
    this.svc.getSubCategoriesByCategory(categoryId).subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetSubCategoryResponseModel>>) => {
        const subs = res?.data?.records ?? [];
        this.subCategoriesMap.set(categoryId, subs);
        subs.forEach((sub) => {
          if (!this.servicesMap.has(sub.id)) this.loadServices(sub.id);
        });
      },
    });
  }
  navigateToService(serviceId: number): void {
    this.router.navigate([ROUTES.SERVICE_MANAGEMENT.SERVICE_DETAIL_ABSOLUTE, serviceId]);
  }

  //  Services
  buildRequest(subCategoryId: number, filters?: ServiceFilterValues): FilterServicesRequestModel {
    return {
      subCategoryId,
      filterSubCategoryId: filters?.subCategoryId ?? null,
      minPrice: filters?.minPrice ?? null,
      maxPrice: filters?.maxPrice ?? null,
      isAvailable: filters?.isAvailable ?? null,
      commission: filters?.commission ?? null,
      pageNumber: 0,
      pageSize: 0,
    };
  }

  loadServices(subCategoryId: number, filters?: ServiceFilterValues): void {
    const request = this.buildRequest(subCategoryId, filters);
    this.svc.getServicesBySubCategory(request).subscribe({
      next: (res: ApiResponse<FilteredDataQueryResponseModel<GetServicesListResponseModel>>) => {
        this.servicesMap.set(subCategoryId, res?.data?.records ?? []);
        const maxAmount = res?.data?.filterMeta?.maxAmount;
        if (maxAmount !== null && maxAmount !== undefined) {
          this.maxPricePerSubCategory.set(subCategoryId, Math.ceil(maxAmount));
        }
      },
    });
  }

  getServices(serviceTypeId: number): GetServicesListResponseModel[] {
    const categoryId = this.selectedCategoryMap.get(serviceTypeId);
    if (!categoryId) return [];
    const subs = this.subCategoriesMap.get(categoryId) ?? [];
    return subs.flatMap((sub) => this.servicesMap.get(sub.id) ?? []);
  }

  getServicesCountForCategory(categoryId: number): number {
    const subs = this.subCategoriesMap.get(categoryId) ?? [];
    return subs.reduce((total, sub) => total + (this.servicesMap.get(sub.id)?.length ?? 0), 0);
  }

  toggleSubCategoryActive(item: GetServicesListResponseModel, checked: boolean): void {
    const previous = item.isAvailable;
    item.isAvailable = checked;
    this.svc.toggleServiceAvailability(item.id, checked).subscribe({
      error: (err: any) => {
        item.isAvailable = previous;
        this.toastr.error(err?.error?.message);
      },
    });
  }

  //  Filter
  openFilter(serviceTypeId: number): void {
    this.openFilterServiceTypeId = serviceTypeId;
  }

  getActiveFilterValues(
    serviceTypeId: number
  ): Record<string, number | string | boolean | null> | null {
    const active = this.activeFiltersMap.get(serviceTypeId);
    if (!active) return null;
    return {
      price_min: active.minPrice ?? null,
      price_max: active.maxPrice ?? null,
      subCategoryId: active.subCategoryId ?? '',
      isAvailable:
        active.isAvailable === true ? 'true' : active.isAvailable === false ? 'false' : '',
      commission: active.commission ?? '',
    };
  }

  getFilterPanelConfig(serviceTypeId: number): FilterPanelConfig {
    const categoryId = this.selectedCategoryMap.get(serviceTypeId);
    const subCategoryOptions = categoryId
      ? (this.subCategoriesMap.get(categoryId) ?? []).map((s) => ({
          value: s.id,
          label: s.subCategoryName,
        }))
      : [];

    const subs = categoryId ? this.subCategoriesMap.get(categoryId) ?? [] : [];
    const maxPrice =
      subs.reduce((acc, sub) => {
        const m = this.maxPricePerSubCategory.get(sub.id) ?? 0;
        return m > acc ? m : acc;
      }, 0) || 1000;

    return {
      title: 'Filter Services',
      fields: [
        {
          key: 'subCategoryId',
          label: 'Sub Category',
          type: 'select',
          placeholder: 'All Sub Categories',
          options: subCategoryOptions,
        },
        {
          key: 'price',
          label: 'Price',
          type: 'price-range',
          max: maxPrice,
        },
        {
          key: 'isAvailable',
          label: 'Availability',
          type: 'select',
          placeholder: 'All',
          options: [
            { value: 'true', label: 'Available' },
            { value: 'false', label: 'Not Available' },
          ],
        },
        {
          key: 'commission',
          label: 'Commission',
          type: 'select',
          placeholder: 'Any Commission',
          options: [5, 10, 15, 20, 25].map((v) => ({ value: v, label: `${v}%` })),
        },
      ],
      onFilter: (values: FilterValues) => this.applyFilter(serviceTypeId, values),
      onCancel: () => this.cancelFilter(serviceTypeId),
    };
  }

  applyFilter(serviceTypeId: number, values: FilterValues): void {
    const mapped: ServiceFilterValues = {
      subCategoryId: (values['subCategoryId'] as number) ?? null,
      minPrice: (values['price_min'] as number) ?? null,
      maxPrice: (values['price_max'] as number) ?? null,
      isAvailable: (values['isAvailable'] as boolean) ?? null,
      commission: (values['commission'] as number) ?? null,
    };

    const hasAny = Object.values(mapped).some((v) => v !== null);

    if (hasAny) {
      this.activeFiltersMap.set(serviceTypeId, mapped);
    } else {
      this.activeFiltersMap.delete(serviceTypeId);
    }

    this.openFilterServiceTypeId = null;

    if (hasAny) {
      const categoryId = this.selectedCategoryMap.get(serviceTypeId);
      const subs = this.subCategoriesMap.get(categoryId!) ?? [];
      subs.forEach((sub) => this.loadServices(sub.id, mapped));
    } else {
      this.categoriesMap.delete(serviceTypeId);
      this.loadAllDataForServiceType(serviceTypeId);
    }
  }

  cancelFilter(serviceTypeId: number): void {
    this.openFilterServiceTypeId = null;

    if (this.activeFiltersMap.has(serviceTypeId)) {
      this.activeFiltersMap.delete(serviceTypeId);
      this.categoriesMap.delete(serviceTypeId);
      this.loadAllDataForServiceType(serviceTypeId);
    }
  }

  //  Add Service Modal
  openAddService(serviceTypeId: number, categoryId: number): void {
    this.addServiceServiceTypeId = serviceTypeId;
    this.addServiceCategoryId = categoryId;
    this.isAddServiceModalOpen = true;
  }

  getAddServiceSubCategories(): GetSubCategoryResponseModel[] {
    if (!this.addServiceCategoryId) return [];
    return this.subCategoriesMap.get(this.addServiceCategoryId) ?? [];
  }

  getAddServiceTitle(): string {
    if (!this.addServiceServiceTypeId || !this.addServiceCategoryId) return 'Add Service';
    const stName =
      this.serviceTypes.find((s) => s.id === this.addServiceServiceTypeId)?.serviceName ?? '';
    return `${stName}`;
  }

  handleServiceSave(): void {
    this.closeAddServiceModal();
    this.closeEditServiceModal();
    this.reloadCurrentCategory();
  }

  closeAddServiceModal(): void {
    this.isAddServiceModalOpen = false;
  }

  closeEditServiceModal(): void {
    this.isEditServiceModalOpen = false;
    this.editServiceId = null;
  }

  private reloadCurrentCategory(): void {
    const subs = this.subCategoriesMap.get(this.addServiceCategoryId!) ?? [];
    subs.forEach((sub) => this.loadServices(sub.id));
  }

  //  Action dropdown
  toggleDropdown(id: number, e: MouseEvent): void {
    e.stopPropagation();
    this.activeDropdownServiceId = this.activeDropdownServiceId === id ? null : id;
  }

  closeDropdowns(): void {
    this.activeDropdownServiceId = null;
  }

  //  Edit service
  openEditService(serviceTypeId: number, item: GetServicesListResponseModel, e: MouseEvent): void {
    e.stopPropagation();
    this.activeDropdownServiceId = null;
    this.addServiceCategoryId = this.selectedCategoryMap.get(serviceTypeId) ?? null;
    this.editServiceId = item.id;
    this.isEditServiceModalOpen = true;
  }

  //  Delete service
  openDeleteService(
    serviceTypeId: number,
    item: GetServicesListResponseModel,
    e: MouseEvent
  ): void {
    e.stopPropagation();
    this.activeDropdownServiceId = null;
    this.addServiceCategoryId = this.selectedCategoryMap.get(serviceTypeId) ?? null;
    this.serviceToDelete = { id: item.id, name: item.name };
    this.deleteServiceConfig = createDeleteConfig(item.name);
    this.isDeleteServiceModalOpen = true;
  }

  confirmDeleteService(): void {
    if (!this.serviceToDelete) return;
    this.svc.deleteService(this.serviceToDelete.id).subscribe({
      next: (res: any) => {
        this.isDeleteServiceModalOpen = false;
        this.serviceToDelete = null;
        this.deleteServiceConfig = null;
        this.toastr.success(res?.message);
        const subs = this.subCategoriesMap.get(this.addServiceCategoryId!) ?? [];
        subs.forEach((sub) => this.loadServices(sub.id));
      },
      error: (err: any) => this.toastr.error(err?.error?.message),
    });
  }

  getImageUrl(id: number): string {
    return this.svc.getImageUrl(id);
  }

  //  Manage Category Modal
  openManagePopup(service: GetServiceTypeResponseModel, event: MouseEvent): void {
    event.stopPropagation();
    this.serviceTypeId = service.id;
    this.serviceTypeName = service.serviceName;
    this.isModalOpen = true;
    this.loadCategoriesForModal();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.subCategories = [];
    this.selectedCategoryIdForSub = null;
    this.selectedCategoryTempIdForSub = null;
    this.pendingCategories = [];
    this.pendingSubCategories = [];
    this.pendingDeletedCategories = [];
    this.pendingDeletedSubCategories = [];
  }

  loadCategoriesForModal(): void {
    this.masterDataService.getCategoriesByServiceType(this.serviceTypeId).subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetCategoryResponseModel>>) => {
        this.categories = (res?.data?.records ?? []).filter(
          (c) => !this.pendingDeletedCategories.includes(c.id)
        );
        this.subCategories = [];
      },
      error: (err: any) => this.toastr.error(err?.error?.message),
    });
  }

  //  Category operations (modal)
  openAddCategoryModal(): void {
    this.existingCategoryNames = [
      ...this.categories.map((c) => c.categoryName),
      ...this.pendingCategories.map((c) => c.categoryName),
    ];
    this.isAddCategoryModalOpen = true;
  }

  closeAddCategoryModal(): void {
    this.isAddCategoryModalOpen = false;
  }

  onCategoryAdded(event: { name: string; tempId: string }): void {
    this.pendingCategories = [
      ...this.pendingCategories,
      { tempId: event.tempId, categoryName: event.name },
    ];
  }

  removePendingCategory(tempId: string): void {
    this.pendingCategories = this.pendingCategories.filter((c) => c.tempId !== tempId);
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryIdForSub = categoryId;
    this.selectedCategoryTempIdForSub = null;
    this.loadSubCategoriesForModal(categoryId);
  }

  selectPendingCategory(tempId: string): void {
    this.selectedCategoryTempIdForSub = tempId;
    this.selectedCategoryIdForSub = null;
    this.subCategories = [];
  }

  openDeleteCategoryModal(category: GetCategoryResponseModel): void {
    this.selectedDeleteCategoryId = category.id;
    this.deleteConfig = createDeleteConfig(category.categoryName);
    this.deleteModalVisible = true;
  }

  confirmDeleteCategory(): void {
    if (this.selectedDeleteCategoryId) {
      if (!this.pendingDeletedCategories.includes(this.selectedDeleteCategoryId))
        this.pendingDeletedCategories.push(this.selectedDeleteCategoryId);
      this.categories = this.categories.filter((c) => c.id !== this.selectedDeleteCategoryId);
      if (this.selectedCategoryIdForSub === this.selectedDeleteCategoryId) {
        this.selectedCategoryIdForSub = null;
        this.subCategories = [];
      }
    }
    this.deleteModalVisible = false;
  }

  closeDeleteModal(): void {
    this.deleteModalVisible = false;
    this.deleteConfig = null;
  }

  //  SubCategory operations (modal)
  loadSubCategoriesForModal(categoryId: number): void {
    this.masterDataService.getSubCategoriesByCategories(categoryId).subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetSubCategoryResponseModel>>) => {
        this.subCategories = (res?.data?.records ?? []).filter(
          (s) => !this.pendingDeletedSubCategories.includes(s.id)
        );
      },
      error: (err: any) => this.toastr.error(err?.error?.message),
    });
  }

  openAddSubCategoryModal(): void {
    if (!this.selectedCategoryIdForSub && !this.selectedCategoryTempIdForSub) {
      this.toastr.warning('Please select a category first.');
      return;
    }
    const relevantPending = this.pendingSubCategories.filter(
      (s) =>
        (this.selectedCategoryTempIdForSub &&
          s.categoryTempId === this.selectedCategoryTempIdForSub) ||
        (this.selectedCategoryIdForSub && s.categoryId === this.selectedCategoryIdForSub)
    );
    this.existingSubCategoryNames = [
      ...this.subCategories.map((s) => s.subCategoryName),
      ...relevantPending.map((s) => s.subCategoryName),
    ];
    this.isAddSubCategoryModalOpen = true;
  }

  closeAddSubCategoryModal(): void {
    this.isAddSubCategoryModalOpen = false;
  }

  onSubCategoryAdded(event: { name: string; tempId: string }): void {
    this.pendingSubCategories = [
      ...this.pendingSubCategories,
      {
        tempId: event.tempId,
        subCategoryName: event.name,
        categoryId: this.selectedCategoryIdForSub ?? undefined,
        categoryTempId: this.selectedCategoryTempIdForSub ?? undefined,
      },
    ];
  }

  removePendingSubCategory(tempId: string): void {
    this.pendingSubCategories = this.pendingSubCategories.filter((s) => s.tempId !== tempId);
  }

  openDeleteSubCategoryModal(sub: GetSubCategoryResponseModel): void {
    this.selectedDeleteSubCategoryId = sub.id;
    this.deleteSubCategoryConfig = createDeleteConfig(sub.subCategoryName);
    this.deleteSubCategoryModalVisible = true;
  }

  confirmDeleteSubCategory(): void {
    if (this.selectedDeleteSubCategoryId) {
      if (!this.pendingDeletedSubCategories.includes(this.selectedDeleteSubCategoryId))
        this.pendingDeletedSubCategories.push(this.selectedDeleteSubCategoryId);
      this.subCategories = this.subCategories.filter(
        (s) => s.id !== this.selectedDeleteSubCategoryId
      );
    }
    this.deleteSubCategoryModalVisible = false;
  }

  closeDeleteSubCategoryModal(): void {
    this.deleteSubCategoryModalVisible = false;
  }

  //  Save all

  saveAllToDb(): void {
    const hasAdditions = this.pendingCategories.length > 0 || this.pendingSubCategories.length > 0;
    const hasDeletions =
      this.pendingDeletedCategories.length > 0 || this.pendingDeletedSubCategories.length > 0;

    if (!hasAdditions && !hasDeletions) {
      this.toastr.warning('Nothing to save.');
      return;
    }

    const deleteRequests: Observable<any>[] = [
      ...this.pendingDeletedSubCategories.map((id) => this.masterDataService.deleteSubCategory(id)),
      ...this.pendingDeletedCategories.map((id) => this.masterDataService.deleteCategory(id)),
    ];

    if (deleteRequests.length > 0) {
      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.pendingDeletedCategories = [];
          this.pendingDeletedSubCategories = [];
          if (hasAdditions) {
            this.processAdditions();
          } else {
            this.onSaveComplete();
          }
        },
        error: (err: any) => this.toastr.error(err?.error?.message),
      });
    } else {
      this.processAdditions();
    }
  }

  private processAdditions(): void {
    if (this.pendingCategories.length === 0) {
      this.savePendingSubCategories({});
      return;
    }

    const tempToRealId: { [tempId: string]: number } = {};
    let completed = 0;

    this.pendingCategories.forEach((cat) => {
      const request: CreateCategoryRequestModel = {
        categoryname: cat.categoryName,
        serviceTypeId: this.serviceTypeId,
      };
      this.masterDataService.createCategory(request).subscribe({
        next: (res: ApiResponse<GetCategoryResponseModel>) => {
          if (res?.data?.id) tempToRealId[cat.tempId] = res.data.id;
          if (++completed === this.pendingCategories.length)
            this.savePendingSubCategories(tempToRealId);
        },
        error: (err: any) => this.toastr.error(err?.error?.message),
      });
    });
  }

  private savePendingSubCategories(tempToRealId: { [tempId: string]: number }): void {
    const subRequests = this.pendingSubCategories.map((sub) => {
      const request: CreateSubCategoryRequestModel = {
        subcategoryname: sub.subCategoryName,
        categoryId: sub.categoryId ?? tempToRealId[sub.categoryTempId!],
      };
      return this.masterDataService.createSubCategory(request);
    });

    if (subRequests.length === 0) {
      this.onSaveComplete();
      return;
    }
    forkJoin(subRequests).subscribe({
      next: () => this.onSaveComplete(),
      error: (err: any) => this.toastr.error(err?.error?.message),
    });
  }

  private onSaveComplete(): void {
    this.pendingCategories = [];
    this.pendingSubCategories = [];
    this.pendingDeletedCategories = [];
    this.pendingDeletedSubCategories = [];
    this.categoriesMap.delete(this.serviceTypeId);
    this.loadAllDataForServiceType(this.serviceTypeId);
    this.loadCategoriesForModal();
    this.toastr.success('All data saved successfully!');
  }
}