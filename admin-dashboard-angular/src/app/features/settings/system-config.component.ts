import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataTableComponent, ColumnDefinition, TableAction, TableEvent } from '../../shared/components/data-table.component';
import { ConfigService } from '../../core/services/config.service';
import { SystemConfig, ConfigType } from '../../core/models/config.model';
import { PageRequest, PageResponse } from '../../core/models/api.model';

@Component({
  selector: 'app-system-config',
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
    MatSnackBarModule,
    DataTableComponent
  ],
  template: `
    <div class="config-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Cấu hình hệ thống</h1>
          <p>Quản lý các cấu hình và thiết lập của hệ thống</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Thêm cấu hình
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline">
              <mat-label>Danh mục</mat-label>
              <mat-select formControlName="category" (selectionChange)="applyFilters()">
                <mat-option value="">Tất cả danh mục</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category">
                  {{ category }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Loại dữ liệu</mat-label>
              <mat-select formControlName="type" (selectionChange)="applyFilters()">
                <mat-option value="">Tất cả loại</mat-option>
                <mat-option *ngFor="let type of configTypes" [value]="type.value">
                  {{ type.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Trạng thái</mat-label>
              <mat-select formControlName="readOnly" (selectionChange)="applyFilters()">
                <mat-option value="">Tất cả</mat-option>
                <mat-option value="false">Có thể chỉnh sửa</mat-option>
                <mat-option value="true">Chỉ đọc</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button type="button" (click)="resetFilters()" matTooltip="Xóa bộ lọc">
              <mat-icon>clear</mat-icon>
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <app-data-table
        [data]="configs"
        [columns]="columns"
        [loading]="loading"
        [totalCount]="totalCount"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        [selectable]="true"
        [searchable]="true"
        [rowActions]="rowActions"
        [globalActions]="globalActions"
        title="Danh sách cấu hình"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (search)="onSearch($event)"
        (action)="onTableAction($event)"
        (rowClick)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .config-container {
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .header-content p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filter-card {
      margin-bottom: 24px;
    }

    .filter-form {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .filter-form mat-form-field {
      min-width: 200px;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .filter-form {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-form mat-form-field {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class SystemConfigComponent implements OnInit {
  configs: SystemConfig[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;
  
  filterForm: FormGroup;
  categories: string[] = [];
  
  configTypes = [
    { value: ConfigType.STRING, label: 'Chuỗi' },
    { value: ConfigType.NUMBER, label: 'Số' },
    { value: ConfigType.BOOLEAN, label: 'Boolean' },
    { value: ConfigType.JSON, label: 'JSON' }
  ];

  columns: ColumnDefinition[] = [
    {
      key: 'key',
      label: 'Khóa cấu hình',
      type: 'text',
      sortable: true,
      width: '200px'
    },
    {
      key: 'description',
      label: 'Mô tả',
      type: 'text',
      sortable: true
    },
    {
      key: 'value',
      label: 'Giá trị',
      type: 'custom',
      width: '200px'
    },
    {
      key: 'type',
      label: 'Loại',
      type: 'custom',
      width: '100px'
    },
    {
      key: 'category',
      label: 'Danh mục',
      type: 'text',
      sortable: true,
      width: '120px'
    },
    {
      key: 'isReadOnly',
      label: 'Chỉ đọc',
      type: 'boolean',
      width: '100px'
    },
    {
      key: 'updatedAt',
      label: 'Cập nhật',
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
      action: 'edit',
      disabled: (row: SystemConfig) => row.isReadOnly
    },
    {
      icon: 'content_copy',
      label: 'Sao chép',
      action: 'copy'
    },
    {
      icon: 'delete',
      label: 'Xóa',
      action: 'delete',
      color: 'warn',
      disabled: (row: SystemConfig) => row.isReadOnly
    }
  ];

  globalActions: TableAction[] = [
    {
      icon: 'save',
      label: 'Lưu thay đổi',
      action: 'save-all',
      color: 'primary'
    },
    {
      icon: 'refresh',
      label: 'Tải lại',
      action: 'reload'
    },
    {
      icon: 'file_download',
      label: 'Xuất cấu hình',
      action: 'export'
    },
    {
      icon: 'file_upload',
      label: 'Nhập cấu hình',
      action: 'import'
    }
  ];

  constructor(
    private configService: ConfigService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      type: [''],
      readOnly: ['']
    });
  }

  ngOnInit() {
    this.loadConfigs();
    this.loadCategories();
  }

  loadConfigs() {
    this.loading = true;
    
    const pageRequest: PageRequest = {
      page: this.pageIndex,
      size: this.pageSize
    };

    const filters = this.getFilters();
    
    this.configService.getConfigs(pageRequest, filters).subscribe({
      next: (response: PageResponse<SystemConfig>) => {
        this.configs = response.content;
        this.totalCount = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Lỗi khi tải danh sách cấu hình', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadCategories() {
    this.configService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  getFilters() {
    const formValue = this.filterForm.value;
    const filters: any = {};
    
    if (formValue.category) {
      filters.category = formValue.category;
    }
    
    if (formValue.type) {
      filters.type = formValue.type;
    }
    
    if (formValue.readOnly !== '') {
      filters.isReadOnly = formValue.readOnly === 'true';
    }
    
    return filters;
  }

  applyFilters() {
    this.pageIndex = 0;
    this.loadConfigs();
  }

  resetFilters() {
    this.filterForm.reset();
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadConfigs();
  }

  onSortChange(event: any) {
    console.log('Sort change:', event);
    this.loadConfigs();
  }

  onSearch(searchTerm: string) {
    console.log('Search:', searchTerm);
    this.pageIndex = 0;
    this.loadConfigs();
  }

  onTableAction(event: TableEvent) {
    switch (event.action) {
      case 'edit':
        this.editConfig(event.row);
        break;
      case 'copy':
        this.copyConfig(event.row);
        break;
      case 'delete':
        this.deleteConfig(event.row);
        break;
      case 'save-all':
        this.saveAllChanges();
        break;
      case 'reload':
        this.loadConfigs();
        break;
      case 'export':
        this.exportConfigs();
        break;
      case 'import':
        this.importConfigs();
        break;
    }
  }

  onRowClick(config: SystemConfig) {
    if (!config.isReadOnly) {
      this.editConfig(config);
    }
  }

  openCreateDialog() {
    console.log('Open create config dialog');
  }

  editConfig(config: SystemConfig) {
    console.log('Edit config:', config);
  }

  copyConfig(config: SystemConfig) {
    console.log('Copy config:', config);
  }

  deleteConfig(config: SystemConfig) {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
      this.configService.deleteConfig(config.id).subscribe({
        next: () => {
          this.snackBar.open('Đã xóa cấu hình', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadConfigs();
        },
        error: (error) => {
          this.snackBar.open('Lỗi khi xóa cấu hình', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  saveAllChanges() {
    console.log('Save all changes');
  }

  exportConfigs() {
    console.log('Export configs');
  }

  importConfigs() {
    console.log('Import configs');
  }

  getTypeLabel(type: ConfigType): string {
    const typeObj = this.configTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  formatValue(config: SystemConfig): string {
    switch (config.type) {
      case ConfigType.BOOLEAN:
        return config.value === 'true' ? 'Có' : 'Không';
      case ConfigType.JSON:
        try {
          return JSON.stringify(JSON.parse(config.value), null, 2);
        } catch {
          return config.value;
        }
      default:
        return config.value;
    }
  }
}
