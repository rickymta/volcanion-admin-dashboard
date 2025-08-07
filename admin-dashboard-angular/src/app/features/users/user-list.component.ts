import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataTableComponent, ColumnDefinition, TableAction, TableEvent } from '../../shared/components/data-table.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { PageRequest, PageResponse } from '../../core/models/api.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    DataTableComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;
  
  filterForm: FormGroup;
  availableRoles = [
    { id: 'admin', name: 'Quản trị viên' },
    { id: 'manager', name: 'Quản lý' },
    { id: 'user', name: 'Người dùng' }
  ];

  columns: ColumnDefinition[] = [
    {
      key: 'avatar',
      label: 'Avatar',
      type: 'custom',
      width: '80px'
    },
    {
      key: 'firstName',
      label: 'Họ tên',
      type: 'text',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      sortable: true
    },
    {
      key: 'username',
      label: 'Tên đăng nhập',
      type: 'text',
      sortable: true
    },
    {
      key: 'roles',
      label: 'Vai trò',
      type: 'custom'
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      type: 'boolean',
      width: '120px'
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      type: 'date',
      sortable: true,
      width: '150px'
    },
    {
      key: 'actions',
      label: 'Thao tác',
      type: 'actions',
      width: '100px'
    }
  ];

  rowActions: TableAction[] = [
    {
      icon: 'edit',
      label: 'Chỉnh sửa',
      action: 'edit'
    },
    {
      icon: 'security',
      label: 'Phân quyền',
      action: 'permissions'
    },
    {
      icon: 'lock',
      label: 'Đặt lại mật khẩu',
      action: 'reset-password'
    },
    {
      icon: 'block',
      label: 'Vô hiệu hóa',
      action: 'deactivate',
      color: 'warn',
      disabled: (row: User) => !row.isActive
    },
    {
      icon: 'check_circle',
      label: 'Kích hoạt',
      action: 'activate',
      color: 'primary',
      disabled: (row: User) => row.isActive
    },
    {
      icon: 'delete',
      label: 'Xóa',
      action: 'delete',
      color: 'warn'
    }
  ];

  globalActions: TableAction[] = [
    {
      icon: 'file_download',
      label: 'Xuất Excel',
      action: 'export'
    },
    {
      icon: 'delete_sweep',
      label: 'Xóa đã chọn',
      action: 'bulk-delete',
      color: 'warn'
    }
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      isActive: [''],
      role: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    
    const pageRequest: PageRequest = {
      page: this.pageIndex,
      size: this.pageSize
    };

    const filters = this.getFilters();
    
    this.userService.getUsers(pageRequest, filters).subscribe({
      next: (response: PageResponse<User>) => {
        this.users = response.content;
        this.totalCount = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Lỗi khi tải danh sách người dùng', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getFilters() {
    const formValue = this.filterForm.value;
    const filters: any = {};
    
    if (formValue.isActive !== '') {
      filters.isActive = formValue.isActive === 'true';
    }
    
    if (formValue.role) {
      filters.role = formValue.role;
    }
    
    return filters;
  }

  applyFilters() {
    this.pageIndex = 0;
    this.loadUsers();
  }

  resetFilters() {
    this.filterForm.reset();
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(event: any) {
    // Implement sorting
    console.log('Sort change:', event);
    this.loadUsers();
  }

  onSearch(searchTerm: string) {
    // Implement search
    console.log('Search:', searchTerm);
    this.pageIndex = 0;
    this.loadUsers();
  }

  onTableAction(event: TableEvent) {
    switch (event.action) {
      case 'edit':
        this.editUser(event.row);
        break;
      case 'permissions':
        this.managePermissions(event.row);
        break;
      case 'reset-password':
        this.resetPassword(event.row);
        break;
      case 'activate':
        this.activateUser(event.row);
        break;
      case 'deactivate':
        this.deactivateUser(event.row);
        break;
      case 'delete':
        this.deleteUser(event.row);
        break;
      case 'export':
        this.exportUsers();
        break;
      case 'bulk-delete':
        if (event.rows) {
          this.bulkDeleteUsers(event.rows);
        }
        break;
    }
  }

  onRowClick(user: User) {
    this.editUser(user);
  }

  openCreateDialog() {
    // Open create user dialog
    console.log('Open create user dialog');
  }

  editUser(user: User) {
    // Open edit user dialog
    console.log('Edit user:', user);
  }

  managePermissions(user: User) {
    // Open permissions dialog
    console.log('Manage permissions for user:', user);
  }

  resetPassword(user: User) {
    // Implement password reset
    console.log('Reset password for user:', user);
  }

  activateUser(user: User) {
    this.userService.activateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('Đã kích hoạt người dùng', 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Lỗi khi kích hoạt người dùng', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deactivateUser(user: User) {
    this.userService.deactivateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('Đã vô hiệu hóa người dùng', 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Lỗi khi vô hiệu hóa người dùng', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteUser(user: User) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Đã xóa người dùng', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi xóa người dùng', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  exportUsers() {
    // Implement export functionality
    console.log('Export users');
  }

  bulkDeleteUsers(users: User[]) {
    if (confirm(`Bạn có chắc chắn muốn xóa ${users.length} người dùng đã chọn?`)) {
      // Implement bulk delete
      console.log('Bulk delete users:', users);
    }
  }
}
