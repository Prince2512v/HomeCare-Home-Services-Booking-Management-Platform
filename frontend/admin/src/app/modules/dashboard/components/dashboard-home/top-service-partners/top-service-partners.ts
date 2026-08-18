import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ROUTES } from '@constants';
import { environment } from 'src/environments/environment';
import { TopServicePartnerModel } from '../../../models';
import { DashboardService } from '../../../services';

@Component({
  selector: 'app-top-service-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-service-partners.html',
  styleUrl: './top-service-partners.css',
})
export class TopServicePartners implements OnInit {
  partners: TopServicePartnerModel[] = [];
  private svc = inject(DashboardService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadTopServicePartners();
  }

  private loadTopServicePartners(): void {
    this.svc.getAllTopServicePartners().subscribe({
      next: (res: any) => {
        this.partners = (res.data ?? []).slice(0, 5);
      },
    });
  }

  goToServicePartners(): void {
    this.router.navigate([ROUTES.USER_MANAGEMENT.SERVICE_PARTNERS.SERVICE_PARTNERS_ABSOLUTE]);
  }

  medalSrc(rank: number): string {
    if (rank === 0) return 'assets/images/admin/medal-gold.svg';
    if (rank === 1) return 'assets/images/admin/medal-silver.svg';
    if (rank === 2) return 'assets/images/admin/medal-bronze.svg';
    return '';
  }

  isMedalRank(rank: number): boolean {
    return rank < 3;
  }

  rankLabel(rank: number): string {
    return rank + 1 + '.';
  }

  partnerImage(url: string | null): string {
    if (!url) return 'assets/images/admin/profile-image.svg';
    if (url.startsWith('http')) return url;
    return `${environment.resourceUrl}/resources/ServicePartner/${url}`;
  }
}