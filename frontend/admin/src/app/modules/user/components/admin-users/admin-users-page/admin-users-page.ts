import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Button,
  ButtonInputConfig,
  DeleteModel,
  DeleteModelConfig,
  FilterPanel,
  FilterPanelConfig,
  FilterValues,
  PaginationComponent,
  createDeleteConfig,
} from '@common';
import { DEFAULT_PAGINATION } from '@constants';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '@services';
import { IdFormat } from '@pipe';
import { AdminUserService } from '../../../services';
import { GetAdminUserResponseModel, FilterAdminUserRequestModel } from '../../../models';
import { AdminUsersModal } from '../admin-users-modal/admin-users-modal';
import { ChangePasswordModal } from '../change-password-modal/change-password-modal';

const DROPDOWN_WIDTH = 190;
const DROPDOWN_HEIGHT = 138;

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    AdminUsersModal,
    ChangePasswordModal,
    DeleteModel,
    FilterPanel,
    PaginationComponent,
    IdFormat,
  ],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.css',
})
export class AdminUsersPage implements OnInit {
  private adminUserService = inject(AdminUserService);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);

  users: GetAdminUserResponseModel[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = DEFAULT_PAGINATION.currentPage;
  itemsPerPage = DEFAULT_PAGINATION.itemsPerPage;
  totalItems = DEFAULT_PAGINATION.totalItems;

  isFilterOpen = false;
  activeFilterValues: FilterValues | null = null;
  activeFilter: FilterAdminUserRequestModel | null = null;

  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  filterPanelConfig: FilterPanelConfig = {
    fields: [
      {
        key: 'isSuperAdmin',
        label: 'Role',
        type: 'select',
        placeholder: 'Role',
        options: [
          { value: 'true', label: 'Super Admin' },
          { value: 'false', label: 'Admin' },
        ],
      },
      {
        key: 'isActive',
        label: 'Status',
        type: 'select',
        placeholder: 'Status',
        options: [
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ],
      },
    ],
    onFilter: (values) => this.applyFilter(values),
    onCancel: () => this.cancelFilter(),
  };

  filterConfig: ButtonInputConfig = {
    variant: 'filter',
    type: 'button',
    onClick: () => (this.isFilterOpen = true),
  };
  addConfig: ButtonInputConfig = { variant: 'add', type: 'button', onClick: () => this.onAdd() };

  showUserModal = false;
  selectedUser: GetAdminUserResponseModel | null = null;

  showChangePasswordModal = false;
  changePasswordTargetId: number | null = null;
  changePasswordTargetName = '';
  changePasswordTargetEmail = '';

  isDeleteModalOpen = false;
  isDeleting = false;
  deleteConfig: DeleteModelConfig | null = null;
  private userToDelete: GetAdminUserResponseModel | null = null;

  openDropdownId: number | null = null;
  activeDropdownUser: GetAdminUserResponseModel | null = null;
  dropdownX = 0;
  dropdownY = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  get isSuperAdmin(): boolean {
    return this.sessionService.isSuperAdmin;
  }
  get currentUserId(): number | null {
    return this.sessionService.currentUserId;
  }

  canSeeActions(user: GetAdminUserResponseModel): boolean {
    return this.isSuperAdmin || user.id === this.currentUserId;
  }
  canDelete(user: GetAdminUserResponseModel): boolean {
    return this.isSuperAdmin && user.id !== this.currentUserId;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminUserService
      .getAdminUsers({
        pageNumber: this.currentPage,
        pageSize: this.itemsPerPage,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        ...(this.activeFilter ?? {}),
      })
      .subscribe({
        next: (res) => {
          this.users = res.data?.records ?? [];
          this.totalItems = res.data?.totalRecords ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load admin users.';
          this.isLoading = false;
        },
      });
  }

  applyFilter(values: FilterValues): void {
    const toDisplayString = (v: unknown): string | null =>
      v === true || v === 'true' ? 'true' : v === false || v === 'false' ? 'false' : null;
    this.activeFilterValues = {
      isSuperAdmin: toDisplayString(values['isSuperAdmin']),
      isActive: toDisplayString(values['isActive']),
    };
    const toBoolean = (v: unknown): boolean | null =>
      v === true || v === 'true' ? true : v === false || v === 'false' ? false : null;
    this.activeFilter = {
      isSuperAdmin: toBoolean(values['isSuperAdmin']),
      isActive: toBoolean(values['isActive']),
    };
    this.currentPage = 1;
    this.isFilterOpen = false;
    this.loadUsers();
  }

  cancelFilter(): void {
    this.isFilterOpen = false;
    this.activeFilter = null;
    this.activeFilterValues = null;
    this.currentPage = 1;
    this.loadUsers();
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadUsers();
  }

  onAdd(): void {
    this.selectedUser = null;
    this.showUserModal = true;
  }
  onEdit(user: GetAdminUserResponseModel): void {
    this.selectedUser = user;
    this.showUserModal = true;
    this.closeDropdown();
  }

  onChangePassword(user: GetAdminUserResponseModel): void {
    this.changePasswordTargetId = user.id;
    this.changePasswordTargetName = user.name ?? '';
    this.changePasswordTargetEmail = user.email ?? '';
    this.showChangePasswordModal = true;
    this.closeDropdown();
  }

  openDeleteModal(user: GetAdminUserResponseModel): void {
    this.userToDelete = user;
    this.deleteConfig = createDeleteConfig(user.name ?? 'this user');
    this.isDeleteModalOpen = true;
    this.closeDropdown();
  }

  onDeleteConfirm(): void {
    if (!this.userToDelete) return;

    this.isDeleting = true;

    this.adminUserService.deleteAdminUser(this.userToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.users = this.users.filter((u) => u.id !== this.userToDelete!.id);
        this.totalItems = Math.max(0, this.totalItems - 1);
        this.toastr.success('Admin user deleted successfully.');
        this.isDeleteModalOpen = false;
        this.userToDelete = null;
        this.loadUsers();
      },
      error: (err) => {
        this.isDeleting = false;
        this.toastr.error(err?.error?.message);
        this.isDeleteModalOpen = false;
        this.userToDelete = null;
      },
    });
  }

  onDeleteClose(): void {
    if (this.isDeleting) return;
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  onModalSaved(): void {
    this.loadUsers();
  }
  onModalClose(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }
  onChangePasswordClose(): void {
    this.showChangePasswordModal = false;
    this.changePasswordTargetId = null;
    this.changePasswordTargetName = '';
    this.changePasswordTargetEmail = '';
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }
  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadUsers();
  }

  toggleDropdown(user: GetAdminUserResponseModel, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openDropdownId === user.id) {
      this.closeDropdown();
      return;
    }

    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = rect.right - DROPDOWN_WIDTH + window.scrollX;
    if (x < 8) x = 8;
    if (x + DROPDOWN_WIDTH > vw - 8) x = vw - DROPDOWN_WIDTH - 8;

    const spaceBelow = vh - rect.bottom;
    const y =
      spaceBelow >= DROPDOWN_HEIGHT + 8
        ? rect.bottom + window.scrollY + 4
        : rect.top + window.scrollY - DROPDOWN_HEIGHT - 4;

    this.dropdownX = x;
    this.dropdownY = y;
    this.openDropdownId = user.id;
    this.activeDropdownUser = user;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
    this.activeDropdownUser = null;
  }

  @HostListener('window:scroll', []) onWindowScroll(): void {
    this.closeDropdown();
  }
  @HostListener('window:resize', []) onWindowResize(): void {
    this.closeDropdown();
  }

  roleLabel(user: GetAdminUserResponseModel): string {
    return user.role === 'SuperAdmin' ? 'Super Admin' : 'Admin';
  }
}