import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { By } from '@angular/platform-browser';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatProgressBarModule,
        MatChipsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard');
  });

  it('should display stats cards', () => {
    const statsCards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(statsCards.length).toBe(4);
  });

  it('should have correct stats card data', () => {
    expect(component.statsCards.length).toBe(4);
    expect(component.statsCards[0].title).toBe('Tổng người dùng');
    expect(component.statsCards[0].value).toBe(1248);
    expect(component.statsCards[0].icon).toBe('people');
  });

  it('should display recent activities', () => {
    const activityItems = fixture.debugElement.queryAll(By.css('.activity-item'));
    expect(activityItems.length).toBe(5);
  });

  it('should have correct activity data', () => {
    expect(component.recentActivities.length).toBe(5);
    expect(component.recentActivities[0].user).toBe('Nguyễn Văn A');
    expect(component.recentActivities[0].type).toBe('success');
  });

  it('should display system status', () => {
    const statusItems = fixture.debugElement.queryAll(By.css('.status-item'));
    expect(statusItems.length).toBe(4);
  });

  it('should have correct system status data', () => {
    expect(component.systemStatus.length).toBe(4);
    expect(component.systemStatus[0].name).toBe('CPU Usage');
    expect(component.systemStatus[0].value).toBe(75);
  });

  it('should display quick actions', () => {
    const actionButtons = fixture.debugElement.queryAll(By.css('.action-button'));
    expect(actionButtons.length).toBe(4);
  });

  it('should have correct quick actions data', () => {
    expect(component.quickActions.length).toBe(4);
    expect(component.quickActions[0].label).toBe('Thêm người dùng');
    expect(component.quickActions[0].action).toBe('add-user');
  });

  it('should return correct activity icon', () => {
    expect(component.getActivityIcon('success')).toBe('check_circle');
    expect(component.getActivityIcon('warning')).toBe('warning');
    expect(component.getActivityIcon('error')).toBe('error');
    expect(component.getActivityIcon('info')).toBe('info');
    expect(component.getActivityIcon('unknown')).toBe('circle');
  });

  it('should return correct activity type label', () => {
    expect(component.getActivityTypeLabel('success')).toBe('Thành công');
    expect(component.getActivityTypeLabel('warning')).toBe('Cảnh báo');
    expect(component.getActivityTypeLabel('error')).toBe('Lỗi');
    expect(component.getActivityTypeLabel('info')).toBe('Thông tin');
    expect(component.getActivityTypeLabel('unknown')).toBe('Khác');
  });

  it('should call performAction with correct parameter', () => {
    spyOn(component, 'performAction');
    const actionButton = fixture.debugElement.query(By.css('.action-button'));
    
    actionButton.nativeElement.click();
    
    expect(component.performAction).toHaveBeenCalledWith('add-user');
  });

  it('should call loadDashboardData on init', () => {
    spyOn(component, 'loadDashboardData');
    
    component.ngOnInit();
    
    expect(component.loadDashboardData).toHaveBeenCalled();
  });

  it('should have responsive grid layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statsGrid = compiled.querySelector('.stats-grid');
    const contentGrid = compiled.querySelector('.content-grid');
    
    expect(statsGrid).toBeTruthy();
    expect(contentGrid).toBeTruthy();
  });

  it('should display trend indicators correctly', () => {
    const trendElements = fixture.debugElement.queryAll(By.css('.stat-trend'));
    expect(trendElements.length).toBeGreaterThan(0);
  });

  it('should handle activity chips correctly', () => {
    const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
    expect(chips.length).toBe(5); // Same as number of activities
  });

  it('should display progress bars for system status', () => {
    const progressBars = fixture.debugElement.queryAll(By.css('mat-progress-bar'));
    expect(progressBars.length).toBe(4); // Same as number of system status items
  });

  it('should have proper card structure', () => {
    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cards.length).toBeGreaterThan(0);
    
    // Check that each card has proper content
    cards.forEach(card => {
      expect(card.query(By.css('mat-card-content'))).toBeTruthy();
    });
  });
});
