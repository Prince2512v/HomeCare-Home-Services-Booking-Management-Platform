import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { MasterDataService } from '@masterDataServices';
import {
  GetServiceTypeResponseModel,
  GetCategoryResponseModel,
  GetSubCategoryResponseModel,
  CreateCategoryRequestModel,
  CreateSubCategoryRequestModel,
  DataQueryResponseModel
} from '@masterDataModels';
import {
  ServiceTypeModal,
  Button,
  DeleteModel,
  ButtonInputConfig,
  DeleteModelConfig,
  AddcategoryModel,
  createDeleteConfig,
} from '@common';
import { ApiResponse } from '@models';
import { ToastrService } from 'ngx-toastr';
import { PendingSubFilterPipe } from '@pipe';

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ServiceTypeModal,
    Button,
    DeleteModel,
    AddcategoryModel,
    PendingSubFilterPipe,
  ],
  templateUrl: './master-data.html',
  styleUrl: './master-data.css',
})
export class MasterData implements OnInit {
  /* ------------------ SERVICE TYPES ------------------ */
  serviceTypes: GetServiceTypeResponseModel[] = [];
  isAddModalOpen = false;
  isEditModalOpen = false;
  editServiceId: number | null = null;

  activeDropdownId: number | null = null;

  selectedFile: File | null = null;
  uploadedFileName: string = '';

  isDeleteModalOpen = false;
  deleteConfig: DeleteModelConfig | null = null;
  private entityToDelete: { id: number; name: string } | null = null;

  addConfig: ButtonInputConfig = {
    variant: 'add',
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      this.openAddModal();
    },
  };
  /* ------------------ CATEGORY MANAGEMENT ------------------ */

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
  selectedCategory: GetCategoryResponseModel | null = null;
  existingCategoryNames: string[] = [];

  isAddSubCategoryModalOpen = false;

  selectedCategoryIdForSub: number | null = null;
  selectedCategoryTempIdForSub: string | null = null;

  selectedSubCategory: GetSubCategoryResponseModel | null = null;
  existingSubCategoryNames: string[] = [];

  deleteModalVisible = false;
  deleteSubCategoryModalVisible = false;

  selectedDeleteCategoryId!: number;
  selectedDeleteSubCategoryId!: number;

  deleteSubCategoryConfig!: DeleteModelConfig;

  cancelButtonConfig: ButtonInputConfig = {
    variant: 'close',
    onClick: () => this.closeModal(),
  };

  saveButtonConfig: ButtonInputConfig = {
    variant: 'save',
    onClick: () => this.saveAllToDb(),
  };

  constructor(private masterDataService: MasterDataService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadData();
  }

  // for service type
  loadData(): void {
    this.masterDataService.getServiceTypes().subscribe({
      next: (response: any) => {
        this.serviceTypes = response?.data?.records ?? [];
      },
      error: (err) => {
         this.toastr.error(err?.error?.message);
      },
    });
  }

  private imageCacheBuster = new Date().getTime();

  getImageUrl(id: number): string {
    return `${this.masterDataService.getImageUrl(id)}?t=${this.imageCacheBuster}`;
  }

  toggleDropdown(id: number): void {
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  closeDropdowns(): void {
    this.activeDropdownId = null;
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
    this.closeDropdowns();
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  openEditModal(service: GetServiceTypeResponseModel): void {
    this.closeDropdowns();
    this.editServiceId = service.id;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editServiceId = null;
  }

  openDeleteModal(id: number, name: string): void {
    this.entityToDelete = { id, name };
    this.deleteConfig = createDeleteConfig(name);
    this.isDeleteModalOpen = true;
    this.closeDropdowns();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteConfig = null;
    this.entityToDelete = null;
  }

  confirmDelete(): void {
    if (!this.entityToDelete) return;

    this.masterDataService.deleteServiceType(this.entityToDelete.id).subscribe({
      next: (msg) => {
        this.toastr.success(msg.message);
        this.closeDeleteModal();
        this.loadData();
      },
      error: (err) => {
         this.toastr.error(err?.error?.message);
        this.closeDeleteModal();
      },
    });
  }

  handleSave(): void {
    this.closeAddModal();
    this.closeEditModal();
    this.loadData();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      this.uploadedFileName = file.name;
    }
  }

  /* for manage category modal*/

  openManagePopup(service: GetServiceTypeResponseModel): void {
    this.serviceTypeId = service.id;
    this.serviceTypeName = service.serviceName;
    this.isModalOpen = true;
    this.loadCategories();
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

  // for category opreations
  loadCategories(preserveSelection = false): void {
    this.masterDataService.getCategoriesByServiceType(this.serviceTypeId).subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetCategoryResponseModel>>) => {
        const allDbCategories = res?.data?.records || [];
        this.categories = allDbCategories.filter(
          (c) => !this.pendingDeletedCategories.includes(c.id)
        );

        if (!preserveSelection) {
          this.subCategories = [];
        } else if (this.selectedCategoryIdForSub) {
          this.loadSubCategories(this.selectedCategoryIdForSub);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message);
      },
    });
  }
  openAddCategoryModal(): void {
    this.selectedCategory = null;

    this.existingCategoryNames = [
      ...this.categories.map((c) => c.categoryName),
      ...this.pendingCategories.map((c) => c.categoryName),
    ];

    this.isAddCategoryModalOpen = true;
  }

  closeAddCategoryModal(): void {
    this.isAddCategoryModalOpen = false;
    this.selectedCategory = null;
  }

  onCategoryAdded(event: { name: string; tempId: string }): void {
    this.pendingCategories = [
      ...this.pendingCategories,
      {
        tempId: event.tempId,
        categoryName: event.name,
      },
    ];
  }

  removePendingCategory(tempId: string): void {
    this.pendingCategories = this.pendingCategories.filter((c) => c.tempId !== tempId);
  }

  openDeleteCategoryModal(category: GetCategoryResponseModel): void {
    this.selectedDeleteCategoryId = category.id;
    this.deleteConfig = createDeleteConfig(category.categoryName);
    this.deleteModalVisible = true;
  }
  confirmDeleteCategory(): void {
    if (this.selectedDeleteCategoryId) {
      if (!this.pendingDeletedCategories.includes(this.selectedDeleteCategoryId)) {
        this.pendingDeletedCategories.push(this.selectedDeleteCategoryId);
      }
      this.categories = this.categories.filter((c) => c.id !== this.selectedDeleteCategoryId);
      if (this.selectedCategoryIdForSub === this.selectedDeleteCategoryId) {
        this.selectedCategoryIdForSub = null;
        this.subCategories = [];
      }
    }
    this.deleteModalVisible = false;
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryIdForSub = categoryId;
    this.selectedCategoryTempIdForSub = null;
    this.loadSubCategories(categoryId);
  }

  selectPendingCategory(tempId: string): void {
    this.selectedCategoryTempIdForSub = tempId;
    this.selectedCategoryIdForSub = null;
    this.subCategories = [];
  }

  // for subcategory opreations

  loadSubCategories(categoryId: number): void {
    this.selectedCategoryIdForSub = categoryId;

    this.masterDataService.getSubCategoriesByCategories(categoryId).subscribe({
      next: (res: ApiResponse<DataQueryResponseModel<GetSubCategoryResponseModel>>) => {
        const allDbSubCategories = res?.data?.records || [];
        this.subCategories = allDbSubCategories.filter(
          (s) => !this.pendingDeletedSubCategories.includes(s.id)
        );
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message);
      },
    });
  }
  openAddSubCategoryModal(): void {
    if (!this.selectedCategoryIdForSub && !this.selectedCategoryTempIdForSub) {
      this.toastr.warning('Please select a category first.');
      return;
    }

    this.selectedSubCategory = null;

    const relevantPendingSubs = this.pendingSubCategories.filter((s) => {
      return (
        (this.selectedCategoryTempIdForSub &&
          s.categoryTempId === this.selectedCategoryTempIdForSub) ||
        (this.selectedCategoryIdForSub && s.categoryId === this.selectedCategoryIdForSub)
      );
    });

    this.existingSubCategoryNames = [
      ...this.subCategories.map((s) => s.subCategoryName),
      ...relevantPendingSubs.map((s) => s.subCategoryName),
    ];

    this.isAddSubCategoryModalOpen = true;
  }
  closeAddSubCategoryModal(): void {
    this.isAddSubCategoryModalOpen = false;
    this.selectedSubCategory = null;
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

  openDeleteSubCategoryModal(subCategory: GetSubCategoryResponseModel): void {
    this.selectedDeleteSubCategoryId = subCategory.id;
    this.deleteSubCategoryConfig = createDeleteConfig(subCategory.subCategoryName);
    this.deleteSubCategoryModalVisible = true;
  }

  confirmDeleteSubCategory(): void {
    if (this.selectedDeleteSubCategoryId) {
      if (!this.pendingDeletedSubCategories.includes(this.selectedDeleteSubCategoryId)) {
        this.pendingDeletedSubCategories.push(this.selectedDeleteSubCategoryId);
      }
      this.subCategories = this.subCategories.filter(
        (s) => s.id !== this.selectedDeleteSubCategoryId
      );
    }
    this.deleteSubCategoryModalVisible = false;
  }

  closeDeleteSubCategoryModal(): void {
    this.deleteSubCategoryModalVisible = false;
  }

  // for save
  saveAllToDb(): void {
    const hasAdditions = this.pendingCategories.length > 0 || this.pendingSubCategories.length > 0;

    const hasDeletions =
      this.pendingDeletedCategories.length > 0 || this.pendingDeletedSubCategories.length > 0;

    if (!hasAdditions && !hasDeletions) {
      this.toastr.warning('Nothing to save.');
      return;
    }

    const deleteRequests: Observable<any>[] = [];

    this.pendingDeletedSubCategories.forEach((id) => {
      deleteRequests.push(this.masterDataService.deleteSubCategory(id));
    });

    this.pendingDeletedCategories.forEach((id) => {
      deleteRequests.push(this.masterDataService.deleteCategory(id));
    });

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
        error: () => {
          this.toastr.error('Failed to process deletions.');
        },
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
          if (res?.data?.id) {
            tempToRealId[cat.tempId] = res.data.id;
          }
          completed++;
          if (completed === this.pendingCategories.length) {
            this.savePendingSubCategories(tempToRealId);
          }
        },
        error: () => {
          this.toastr.error(`Failed to save category "${cat.categoryName}"`);
        },
      });
    });
  }

  private savePendingSubCategories(tempToRealId: { [tempId: string]: number }): void {
    const subRequests = this.pendingSubCategories.map((sub) => {
      const resolvedCategoryId = sub.categoryId ?? tempToRealId[sub.categoryTempId!];

      const request: CreateSubCategoryRequestModel = {
        subcategoryname: sub.subCategoryName,
        categoryId: resolvedCategoryId,
      };

      return this.masterDataService.createSubCategory(request);
    });

    if (subRequests.length === 0) {
      this.onSaveComplete();
      return;
    }

    forkJoin(subRequests).subscribe({
      next: () => this.onSaveComplete(),
      error: () => {
        this.toastr.error('Failed to save sub-categories.');
      },
    });
  }

  private onSaveComplete(): void {
    this.pendingCategories = [];
    this.pendingSubCategories = [];
    this.pendingDeletedCategories = [];
    this.pendingDeletedSubCategories = [];
    this.loadCategories(true);
    this.toastr.success('All data saved successfully!');
  }
}
