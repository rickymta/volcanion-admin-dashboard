import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { User } from '../core/models/user.model';
import { MenuItem } from '../core/models/app.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav 
        #drawer 
        class="sidenav" 
        fixedInViewport
        [attr.role]="isHandset ? 'dialog' : 'navigation'"
        [mode]="isHandset ? 'over' : 'side'"
        [opened]="!isHandset && !sidebarCollapsed">
        
        <!-- Logo & Title -->
        <div class="sidenav-header">
          <div class="logo-container">
            <mat-icon class="logo-icon">dashboard</mat-icon>
            <span class="logo-text" *ngIf="!sidebarCollapsed || isHandset">Admin Dashboard</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Navigation Menu -->
        <mat-nav-list class="nav-list">
          <ng-container *ngFor="let item of menuItems">
            <!-- Menu Item with Children -->
            <div *ngIf="item.children && item.children.length > 0" class="nav-group">
              <div class="nav-group-title" 
                   [class.collapsed]="sidebarCollapsed && !isHandset"
                   (click)="toggleGroup(item.id)">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span *ngIf="!sidebarCollapsed || isHandset">{{ item.label }}</span>
                <mat-icon class="expand-icon" *ngIf="!sidebarCollapsed || isHandset">
                  {{ expandedGroups.has(item.id) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </div>
              
              <div class="nav-group-items" 
                   *ngIf="expandedGroups.has(item.id) && (!sidebarCollapsed || isHandset)">
                <a *ngFor="let child of item.children"
                   mat-list-item
                   [routerLink]="child.route"
                   routerLinkActive="active"
                   class="nav-item sub-item">
                  <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                  <span matListItemTitle>{{ child.label }}</span>
                </a>
              </div>
            </div>

            <!-- Single Menu Item -->
            <a *ngIf="!item.children || item.children.length === 0"
               mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active"
               class="nav-item"
               [matTooltip]="sidebarCollapsed && !isHandset ? item.label : ''"
               matTooltipPosition="right">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle *ngIf="!sidebarCollapsed || isHandset">{{ item.label }}</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content class="main-content">
        <!-- Top Toolbar -->
        <mat-toolbar class="toolbar" color="primary">
          <!-- Menu Toggle -->
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="toggleSidebar()"
            *ngIf="isHandset">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <!-- Collapse Toggle for Desktop -->
          <button
            type="button"
            aria-label="Collapse sidebar"
            mat-icon-button
            (click)="toggleCollapse()"
            *ngIf="!isHandset">
            <mat-icon>{{ sidebarCollapsed ? 'menu_open' : 'menu' }}</mat-icon>
          </button>

          <!-- Page Title -->
          <span class="page-title">{{ pageTitle }}</span>

          <!-- Spacer -->
          <span class="spacer"></span>

          <!-- Theme Toggle -->
          <button mat-icon-button 
                  (click)="toggleTheme()" 
                  [matTooltip]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>

          <!-- Notifications -->
          <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
            <mat-icon [matBadge]="notificationCount" matBadgeColor="warn">notifications</mat-icon>
          </button>
          <mat-menu #notificationMenu="matMenu" class="notification-menu">
            <div class="notification-header">
              <h4>Notifications</h4>
            </div>
            <mat-divider></mat-divider>
            <div class="notification-item" *ngFor="let notification of notifications">
              <div class="notification-content">
                <p class="notification-title">{{ notification.title }}</p>
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ notification.time | date:'short' }}</span>
              </div>
            </div>
            <div class="notification-footer">
              <button mat-button color="primary">View All</button>
            </div>
          </mat-menu>

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <div class="user-avatar">
                <img *ngIf="currentUser?.avatar" 
                     [src]="currentUser?.avatar" 
                     [alt]="currentUser?.firstName">
                <mat-icon *ngIf="!currentUser?.avatar">account_circle</mat-icon>
              </div>
              <div class="user-details">
                <p class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
                <p class="user-email">{{ currentUser?.email }}</p>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="goToProfile()">
              <mat-icon>person</mat-icon>
              <span>Hồ sơ cá nhân</span>
            </button>
            <button mat-menu-item (click)="goToSettings()">
              <mat-icon>settings</mat-icon>
              <span>Cài đặt</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Đăng xuất</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background: white;
      border-right: 1px solid #e0e0e0;
    }

    .sidenav.collapsed {
      width: 64px;
    }

    .sidenav-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      color: #3f51b5;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .nav-list {
      padding: 8px 0;
    }

    .nav-group-title {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .nav-group-title:hover {
      background-color: #f5f5f5;
    }

    .nav-group-title.collapsed {
      justify-content: center;
      padding: 12px;
    }

    .nav-group-title mat-icon:first-child {
      margin-right: 12px;
      color: #666;
    }

    .expand-icon {
      margin-left: auto;
      color: #666;
    }

    .nav-group-items {
      background-color: #f8f9fa;
    }

    .nav-item {
      color: #666 !important;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background-color: #f5f5f5 !important;
      color: #3f51b5 !important;
    }

    .nav-item.active {
      background-color: #e3f2fd !important;
      color: #3f51b5 !important;
      border-right: 3px solid #3f51b5;
    }

    .sub-item {
      padding-left: 60px !important;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-title {
      font-size: 18px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 24px;
      background-color: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .user-info {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 12px;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .user-email {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .notification-menu {
      width: 320px;
    }

    .notification-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .notification-header h4 {
      margin: 0;
      font-size: 16px;
    }

    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .notification-title {
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .notification-message {
      font-size: 14px;
      color: #666;
      margin: 0 0 4px 0;
    }

    .notification-time {
      font-size: 12px;
      color: #999;
    }

    .notification-footer {
      padding: 12px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .content {
        padding: 16px;
      }
      
      .sidenav {
        width: 100%;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isHandset = false;
  sidebarCollapsed = false;
  isDarkMode = false;
  pageTitle = 'Dashboard';
  notificationCount = 3;
  expandedGroups = new Set<string>();

  notifications = [
    {
      title: 'New User Registration',
      message: 'A new user has registered to the system',
      time: new Date()
    },
    {
      title: 'System Update',
      message: 'System will be updated tonight at 2 AM',
      time: new Date()
    },
    {
      title: 'Backup Completed',
      message: 'Daily backup has been completed successfully',
      time: new Date()
    }
  ];

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      icon: 'people',
      children: [
        {
          id: 'users-list',
          label: 'Danh sách người dùng',
          icon: 'list',
          route: '/users'
        },
        {
          id: 'users-roles',
          label: 'Phân quyền',
          icon: 'security',
          route: '/users/roles'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Cài đặt hệ thống',
      icon: 'settings',
      children: [
        {
          id: 'system-config',
          label: 'Cấu hình hệ thống',
          icon: 'tune',
          route: '/settings/config'
        },
        {
          id: 'system-logs',
          label: 'Nhật ký hệ thống',
          icon: 'history',
          route: '/settings/logs'
        }
      ]
    },
    {
      id: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: 'person',
      route: '/profile'
    }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    // Monitor screen size
    this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isHandset = result.matches;
      });

    // Monitor current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Monitor theme
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkMode = this.themeService.isDarkMode();
      });

    // Load settings
    const settings = this.themeService.getSettings();
    this.sidebarCollapsed = settings.sidebarCollapsed;

    // Initialize expanded groups
    this.expandedGroups.add('users');
    this.expandedGroups.add('settings');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    // This will be handled by the sidenav
  }

  toggleCollapse() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.themeService.updateSettings({ sidebarCollapsed: this.sidebarCollapsed });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleGroup(groupId: string) {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
