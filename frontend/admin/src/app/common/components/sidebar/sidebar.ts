import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ROUTES } from '@constants';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  ROUTES = ROUTES;
  open: boolean = false;

  @ViewChild('userSubmenu') userSubmenu!: ElementRef;

  constructor(private router: Router) {}

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  isActiveGroup(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  openToClose(): void {
    this.open = !this.open;
  }

  closeDropdown(): void {
    if (this.open) {
      this.open = false;
      this.userSubmenu?.nativeElement.classList.remove('show');
    }
  }

  goToHome(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.HOME.HOME_ABSOLUTE]);
  }

  goToServiceManagement(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.SERVICE_MANAGEMENT.SERVICE_MANAGEMENT_ABSOLUTE]);
  }

  goToCustomers(): void {
    this.router.navigate([ROUTES.USER_MANAGEMENT.CUSTOMERS.CUSTOMERS_ABSOLUTE]);
  }

  goToServicePartners(): void {
    this.router.navigate([ROUTES.USER_MANAGEMENT.SERVICE_PARTNERS.SERVICE_PARTNERS_ABSOLUTE]);
  }

  goToAdminUsers(): void {
    this.router.navigate([ROUTES.USER_MANAGEMENT.ADMIN_USERS.ADMIN_USERS_ABSOLUTE]);
  }

  goToBookingManagement(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.BOOKING_MANAGEMENT.BOOKING_MANAGEMENT_ABSOLUTE]);
  }

  goToOffers(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.OFFERS.OFFERS_ABSOLUTE]);
  }

  goToPaymentTransactions(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.PAYMENT_TRANSACTIONS.PAYMENT_TRANSACTIONS_ABSOLUTE]);
  }

  goToMasterData(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.MASTER_DATA.MASTER_DATA_ABSOLUTE]);
  }

  goToSupport(): void {
    this.closeDropdown();
    this.router.navigate([ROUTES.SUPPORT.SUPPORT_ABSOLUTE]);
  }
}