import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, Input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ROUTES } from '@constants';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Input() showBackButton = false;
  @Input() backRoute: string | null = null;

  authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  dropdownOpen = false;
  mobileMenuOpen = signal(false);

  goBack(): void {
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.mobileMenuOpen.set(false);
  }

  goToProfile(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen.set(false);
    this.router.navigate([ROUTES.CUSTOMER.PROFILE.PROFILE_ABSOLUTE]);
  }

  goToMyBookings(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen.set(false);
    this.router.navigate([ROUTES.CUSTOMER.MY_BOOKINGS.MY_BOOKINGS_ABSOLUTE]);
  }

  goToSignIn(): void {
    this.mobileMenuOpen.set(false);
    this.router.navigate([ROUTES.CUSTOMER.SIGN_IN.SIGN_IN_ABSOLUTE]);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
    this.dropdownOpen = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onLogout(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen.set(false);
    this.authService.logout().subscribe({
      next: () =>
        this.router.navigate([ROUTES.CUSTOMER.SIGN_IN.SIGN_IN_ABSOLUTE]),
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-user-area')) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen.set(false);
  }
}