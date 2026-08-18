import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '@auth';
import { TokenService } from '@services';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-checkout-layout',
  imports: [RouterOutlet, Navbar],
  templateUrl: './checkout-layout.html',
  styleUrl: './checkout-layout.css',
})
export class CheckoutLayout implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private tokenCheckSub!: Subscription;

  backRoute: string | null = null;

  ngOnInit(): void {
    if (this.router.url.includes('booking-success')) {
      this.backRoute = '/';
    }
    this.refreshTokenIfExists();
    this.startTokenPolling();
  }

  ngOnDestroy(): void {
    this.tokenCheckSub?.unsubscribe();
  }

  private refreshTokenIfExists(): void {
    if (!this.tokenService.get()) return;
    this.authService.refreshToken().subscribe({
      next: () => {},
      error: () => this.authService.clearSession(),
    });
  }

  private startTokenPolling(): void {
    this.tokenCheckSub = interval(30000).subscribe(() => {
      if (this.authService.currentUser()) {
        this.authService.refreshToken().subscribe({
          next: () => {},
          error: () => this.authService.clearSession(),
        });
      }
    });
  }
}