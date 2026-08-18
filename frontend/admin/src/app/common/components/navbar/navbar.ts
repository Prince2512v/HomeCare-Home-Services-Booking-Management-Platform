import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AdminProfileService } from 'src/app/modules/dashboard/services';
import { ROUTES } from '@constants';
import { AdminProfileModel } from 'src/app/modules/dashboard/models';
import { AuthService } from '@authservices';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  profile: AdminProfileModel | null = null;

  constructor(
    private profileService: AdminProfileService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.profileService.profile$.subscribe((profile: AdminProfileModel | null) => {
      if (!profile) return;
      this.profile = profile;
    });
  }

  logout() {
    this.authService.logout();
  }

  goToProfile() {
    this.router.navigate([ROUTES.PROFILE.PROFILE_ABSOLUTE]);
  }

  @Output() sidebarToggle = new EventEmitter<void>();

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/admin/profile-image.svg';
  }
}