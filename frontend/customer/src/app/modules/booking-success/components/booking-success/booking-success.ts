import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingSuccessStateService } from '@services';
import { ROUTES } from '@constants';
import { Button, ButtonInputConfig } from '@common';
import { BookingSuccessService } from '../../services/booking-success.service';
import { BookingSuccessData } from '../../models/booking-success.models';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.css',
})
export class BookingSuccess implements OnInit, OnDestroy {
  private router = inject(Router);
  private stateService = inject(BookingSuccessStateService);
  private bookingSuccessService = inject(BookingSuccessService);
  addServicesBtnConfig!: ButtonInputConfig;
  myBookingsBtnConfig!: ButtonInputConfig;
  data: BookingSuccessData | null = null;
  partnerAssigned = false;
  private assignTimer: any = null;

  readonly partnerMeta = {
    rating: 4.5,
    reviews: '366k',
  };

  get partnerName(): string {
    return this.data?.assignedPartner?.fullName ?? 'Service Partner';
  }

  get partnerAvatar(): string {
    const profileImage = this.data?.assignedPartner?.profileImageUrl;
    if (profileImage) {
      return this.bookingSuccessService.getPartnerAvatarUrl(profileImage);
    }
    return 'assets/icons/ServicePartner.png';
  }

  ngOnInit(): void {
    this.data = this.stateService.getBookingData();
    if (!this.data) {
      this.router.navigate(['/']);
      return;
    }
    this.initButtonConfigs();
    this.assignTimer = setTimeout(() => {
      this.partnerAssigned = true;
    }, 4500);
  }
  private initButtonConfigs(): void {
    this.addServicesBtnConfig = {
      text: 'Add Services',
      cssClass: 'bsp-add-services-btn',
      onClick: () => this.goToHome(),
    };

    this.myBookingsBtnConfig = {
      text: 'My Bookings',
      cssClass: 'bsp-my-bookings-btn',
      onClick: () => this.goToMyBookings(),
    };
  }

  ngOnDestroy(): void {
    if (this.assignTimer) clearTimeout(this.assignTimer);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(time: string): string {
    if (!time) return '';
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm'))
      return time;
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  downloadInvoice(): void {
    if (!this.data?.bookingId) return;
    this.bookingSuccessService.downloadInvoice(this.data.bookingId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.data!.bookingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () =>
        console.error(
          'Invoice download failed for booking:',
          this.data?.bookingId,
        ),
    });
  }

  goToHome(): void {
    this.router.navigate([ROUTES.CUSTOMER.HOME.HOME_ABSOLUTE]);
  }

  goToMyBookings(): void {
    this.router.navigate(['/customer/my-bookings']);
  }
}