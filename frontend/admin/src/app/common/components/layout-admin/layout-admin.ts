import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminProfileService } from 'src/app/modules/dashboard/services';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';
import { Chatbot } from '../chatbot/chatbot';

@Component({
  selector: 'app-layout-admin',
  imports: [Sidebar, Navbar, RouterOutlet, Chatbot],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.css',
})
export class LayoutAdmin implements OnInit {

  isSidebarOpen = true;
  isMobile = false;

  constructor(private profileService: AdminProfileService) {}

  ngOnInit() {
    this.checkScreen();
    this.profileService.getProfile().subscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreen();
  }

  checkScreen() {
    if (window.innerWidth <= 1025) {
      this.isMobile = true;
      this.isSidebarOpen = false;
    } else {
      this.isMobile = false;
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}