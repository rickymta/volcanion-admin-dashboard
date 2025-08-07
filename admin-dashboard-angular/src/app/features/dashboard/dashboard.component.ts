import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { DashboardCard, Activity, SystemStatus, QuickAction } from './models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  statsCards: DashboardCard[] = [
    {
      title: 'Tổng người dùng',
      value: 1248,
      icon: 'people',
      color: 'primary',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Hoạt động hôm nay',
      value: 156,
      icon: 'trending_up',
      color: 'success',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Cảnh báo',
      value: 3,
      icon: 'warning',
      color: 'warning',
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Lỗi hệ thống',
      value: 0,
      icon: 'error',
      color: 'error',
      trend: { value: 100, isPositive: true }
    }
  ];

  recentActivities: Activity[] = [
    {
      id: '1',
      user: 'Nguyễn Văn A',
      action: 'đã đăng nhập vào',
      target: 'hệ thống',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'success'
    },
    {
      id: '2',
      user: 'Trần Thị B',
      action: 'đã tạo',
      target: 'người dùng mới',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'info'
    },
    {
      id: '3',
      user: 'Lê Văn C',
      action: 'đã cập nhật',
      target: 'cấu hình hệ thống',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'warning'
    },
    {
      id: '4',
      user: 'System',
      action: 'phát hiện',
      target: 'lỗi kết nối database',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'error'
    },
    {
      id: '5',
      user: 'Phạm Thị D',
      action: 'đã xóa',
      target: 'file cũ',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      type: 'info'
    }
  ];

  systemStatus: SystemStatus[] = [
    { name: 'CPU Usage', value: 75 },
    { name: 'Memory Usage', value: 60 },
    { name: 'Disk Space', value: 85 },
    { name: 'Network', value: 95 }
  ];

  quickActions: QuickAction[] = [
    { label: 'Thêm người dùng', icon: 'person_add', color: 'primary', action: 'add-user' },
    { label: 'Backup dữ liệu', icon: 'backup', color: 'accent', action: 'backup' },
    { label: 'Xem báo cáo', icon: 'assessment', color: 'primary', action: 'reports' },
    { label: 'Cài đặt hệ thống', icon: 'settings', color: 'accent', action: 'settings' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Load dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // This would typically load data from services
    console.log('Loading dashboard data...');
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'circle';
    }
  }

  getActivityTypeLabel(type: string): string {
    switch (type) {
      case 'success': return 'Thành công';
      case 'warning': return 'Cảnh báo';
      case 'error': return 'Lỗi';
      case 'info': return 'Thông tin';
      default: return 'Khác';
    }
  }

  performAction(action: string): void {
    console.log('Performing action:', action);
    // Implement specific actions here
  }
}
