import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ROUTES } from '@constants';
import { AuthService } from '@auth';

@Component({
  selector: 'app-main',
  imports: [],
  template: '',
})
export class MainComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenCheckSubscription!: Subscription;

  ngOnInit(): void {
    this.checkAndRefreshToken();
    this.tokenCheckSubscription = interval(30000).subscribe(() => {
      this.checkAndRefreshToken();
    });
  }

  ngOnDestroy(): void {
    this.tokenCheckSubscription?.unsubscribe();
  }

  private checkAndRefreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: () => {},
      error: () => {
        this.authService.clearSession();
        this.router.navigate([ROUTES.CUSTOMER.SIGN_IN.SIGN_IN_ABSOLUTE]);
      },
    });
  }
}