import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '@auth';
import { TokenService } from '@services';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.css',
})
export class CustomerLayout implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private tokenCheckSubscription!: Subscription;

  ngOnInit(): void {
    if (this.tokenService.get()) {
      this.authService.refreshToken().subscribe({
        next: () => {},
        error: () => this.authService.clearSession(),
      });
    }

    this.tokenCheckSubscription = interval(30000).subscribe(() => {
      if (this.authService.currentUser()) {
        this.authService.refreshToken().subscribe({
          next: () => {},
          error: () => this.authService.clearSession(),
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.tokenCheckSubscription?.unsubscribe();
  }
}