import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '@MyBookingsService';
import { ServicePartnerService } from '@ServicePatnerService';
import {
  MyBooking,
  BookingTab,
  BookingStatusLabel,
  BookingStatusClass,
} from '@MyBookingsModels';

const INITIAL_VISIBLE = 3;

@Component({
  selector: 'app-my-bookings',
  imports: [CommonModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
})
export class MyBookings implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly servicePartnerService = inject(ServicePartnerService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly BookingTab = BookingTab;

  activeTab: BookingTab = 1;
  bookings: MyBooking[] = [];
  isLoading = false;
  downloadingReceiptId: number | null = null;
  visibleCount = INITIAL_VISIBLE;

  readonly BookingStatusLabel = BookingStatusLabel;
  readonly BookingStatusClass = BookingStatusClass;

  ngOnInit(): void {
    this.loadBookings();
  }

  setTab(tab: BookingTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookings = [];
    this.visibleCount = INITIAL_VISIBLE;

    this.bookingService.getMyBookings(this.activeTab).subscribe({
      next: (res) => {
        this.bookings = (res.data ?? []).sort((a, b) => {
          const dateDiff =
            new Date(a.bookingDate).getTime() -
            new Date(b.bookingDate).getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.bookingTime.localeCompare(b.bookingTime);
        });
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error(err?.error?.message);
        this.isLoading = false;
      },
    });
  }

  get visibleBookings(): MyBooking[] {
    return this.bookings.slice(0, this.visibleCount);
  }

  get hasMoreBookings(): boolean {
    return this.bookings.length > this.visibleCount;
  }

  showMore(): void {
    this.visibleCount = this.bookings.length;
  }

  getBookingDay(dateStr: string): string {
    return String(new Date(dateStr).getDate()).padStart(2, '0');
  }

  getBookingMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', { month: 'short' });
  }

  getFullAddress(booking: MyBooking): string {
    if (!booking.address) return '';
    return [
      booking.address.houseFlatNumber,
      booking.address.landmark,
      booking.address.fullAddress,
    ]
      .filter(Boolean)
      .join(', ');
  }

  getPartnerImageUrl(profileImageUrl: string): string {
    return this.servicePartnerService.getProfileImageUrl(profileImageUrl);
  }

  getPartnerInitial(fullName: string): string {
    return fullName?.charAt(0)?.toUpperCase() ?? '?';
  }

  onPartnerImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/icons/ServicePartner.png';
    img.onerror = null; 
  }

  callPartner(mobile: string): void {
    window.open(`tel:${mobile}`);
  }

  downloadReceipt(bookingId: number): void {
    if (this.downloadingReceiptId === bookingId) return;
    this.downloadingReceiptId = bookingId;

    this.bookingService.downloadInvoice(bookingId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `invoice-${bookingId}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloadingReceiptId = null;
      },
      error: (err: HttpErrorResponse) => {
        const raw = err.error;
        if (raw instanceof Blob) {
          raw.text().then((text) => {
            try {
              const parsed = JSON.parse(text);
              this.toastr.error(parsed?.message);
            } catch {
              this.toastr.error(err?.error?.message);
            }
          });
        } else {
          this.toastr.error(err?.error?.message);
        }
        this.downloadingReceiptId = null;
      },
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
