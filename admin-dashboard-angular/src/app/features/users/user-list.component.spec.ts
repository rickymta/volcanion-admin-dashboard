import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { PageResponse, ApiResponse } from '../../core/models/api.model';

// Material modules for testing
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      roles: [{ id: '1', name: 'admin', permissions: [] }],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      username: 'user1',
      email: 'user1@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: false,
      roles: [{ id: '2', name: 'user', permissions: [] }],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockPageResponse: PageResponse<User> = {
    content: mockUsers,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    numberOfElements: 2
  };

  beforeEach(async () => {
    const userServiceSpyObj = jasmine.createSpyObj('UserService', [
      'getUsers', 'activateUser', 'deactivateUser', 'deleteUser'
    ]);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        UserListComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatSnackBarModule,
        MatDialogModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
        { provide: MatDialog, useValue: dialogSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    userServiceSpy.getUsers.and.returnValue(of(mockPageResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.users).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.totalCount).toBe(0);
    expect(component.pageSize).toBe(10);
    expect(component.pageIndex).toBe(0);
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
    expect(component.totalCount).toBe(2);
  });

  it('should handle load users error', () => {
    userServiceSpy.getUsers.and.returnValue(throwError('Error'));
    
    fixture.detectChanges();
    
    expect(component.loading).toBe(false);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Lỗi khi tải danh sách người dùng',
      'Đóng',
      jasmine.any(Object)
    );
  });

  it('should apply filters', () => {
    fixture.detectChanges();
    
    component.filterForm.patchValue({
      isActive: 'true',
      role: 'admin'
    });
    
    component.applyFilters();
    
    expect(component.pageIndex).toBe(0);
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should reset filters', () => {
    component.filterForm.patchValue({
      isActive: 'true',
      role: 'admin'
    });
    
    component.resetFilters();
    
    expect(component.filterForm.value).toEqual({
      isActive: null,
      role: null
    });
  });

  it('should handle page change', () => {
    const pageEvent = { pageIndex: 1, pageSize: 20 };
    
    component.onPageChange(pageEvent);
    
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(20);
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should activate user successfully', () => {
    const mockResponse: ApiResponse<void> = { success: true, data: undefined };
    userServiceSpy.activateUser.and.returnValue(of(mockResponse));
    const user = mockUsers[1]; // inactive user
    
    component.activateUser(user);
    
    expect(userServiceSpy.activateUser).toHaveBeenCalledWith(user.id);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Đã kích hoạt người dùng',
      'Đóng',
      jasmine.any(Object)
    );
  });

  it('should handle activate user error', () => {
    userServiceSpy.activateUser.and.returnValue(throwError('Error'));
    const user = mockUsers[1];
    
    component.activateUser(user);
    
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Lỗi khi kích hoạt người dùng',
      'Đóng',
      jasmine.any(Object)
    );
  });

  it('should deactivate user successfully', () => {
    const mockResponse: ApiResponse<void> = { success: true, data: undefined };
    userServiceSpy.deactivateUser.and.returnValue(of(mockResponse));
    const user = mockUsers[0]; // active user
    
    component.deactivateUser(user);
    
    expect(userServiceSpy.deactivateUser).toHaveBeenCalledWith(user.id);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Đã vô hiệu hóa người dùng',
      'Đóng',
      jasmine.any(Object)
    );
  });

  it('should delete user with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockResponse: ApiResponse<void> = { success: true, data: undefined };
    userServiceSpy.deleteUser.and.returnValue(of(mockResponse));
    const user = mockUsers[0];
    
    component.deleteUser(user);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(user.id);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Đã xóa người dùng',
      'Đóng',
      jasmine.any(Object)
    );
  });

  it('should not delete user without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const user = mockUsers[0];
    
    component.deleteUser(user);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(userServiceSpy.deleteUser).not.toHaveBeenCalled();
  });

  it('should handle table actions', () => {
    spyOn(component, 'editUser');
    spyOn(component, 'deleteUser');
    
    component.onTableAction({ action: 'edit', row: mockUsers[0] });
    expect(component.editUser).toHaveBeenCalledWith(mockUsers[0]);
    
    component.onTableAction({ action: 'delete', row: mockUsers[0] });
    expect(component.deleteUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should get filters correctly', () => {
    component.filterForm.patchValue({
      isActive: 'true',
      role: 'admin'
    });
    
    const filters = component.getFilters();
    
    expect(filters).toEqual({
      isActive: true,
      role: 'admin'
    });
  });

  it('should handle search', () => {
    spyOn(component, 'loadUsers');
    
    component.onSearch('test');
    
    expect(component.pageIndex).toBe(0);
    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should have correct column definitions', () => {
    expect(component.columns.length).toBe(8);
    expect(component.columns[0].key).toBe('avatar');
    expect(component.columns[1].key).toBe('firstName');
    expect(component.columns[2].key).toBe('email');
  });

  it('should have correct row actions', () => {
    expect(component.rowActions.length).toBe(6);
    expect(component.rowActions[0].action).toBe('edit');
    expect(component.rowActions[5].action).toBe('delete');
  });

  it('should have correct global actions', () => {
    expect(component.globalActions.length).toBe(2);
    expect(component.globalActions[0].action).toBe('export');
    expect(component.globalActions[1].action).toBe('bulk-delete');
  });
});
