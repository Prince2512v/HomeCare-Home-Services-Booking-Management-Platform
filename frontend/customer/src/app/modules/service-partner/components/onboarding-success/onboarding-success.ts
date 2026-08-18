import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ROUTES } from '@constants';

@Component({
  selector: 'app-onboarding-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-success.html',
  styleUrl: './onboarding-success.css',
})
export class OnboardingSuccess {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate([ROUTES.CUSTOMER.HOME.HOME]);
  }

  viewServices(): void {
    this.router.navigate([ROUTES.CUSTOMER.SERVICES.SERVICES]);
  }
}
