import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectionModel } from '@angular/cdk/collections';

export interface ColumnDefinition {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'actions' | 'custom';
  sortable?: boolean;
  width?: string;
  sticky?: boolean;
  template?: any;
}

export interface TableAction {
  icon: string;
  label: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (row: any) => boolean;
}

export interface TableEvent {
  action: string;
  row?: any;
  rows?: any[];
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="table-container">
      <!-- Table Toolbar -->
      <div class="table-toolbar" *ngIf="showToolbar">
        <div class="table-title">
          <h3>{{ title }}</h3>
          <span class="table-count" *ngIf="totalCount > 0">
            ({{ totalCount }} items)
          </span>
        </div>
        
        <div class="table-actions">
          <!-- Search -->
          <mat-form-field appearance="outline" class="search-field" *ngIf="searchable">
            <mat-label>Tìm kiếm</mat-label>
            <input matInput 
                   [value]="searchTerm" 
                   (input)="onSearch($event)"
                   placeholder="Nhập từ khóa...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <!-- Global Actions -->
          <ng-container *ngFor="let action of globalActions">
            <button mat-raised-button 
                    [color]="action.color || 'primary'"
                    (click)="onAction(action.action)">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.label }}
            </button>
          </ng-container>
        </div>
      </div>

      <!-- Selection Info -->
      <div class="selection-info" *ngIf="selectable && selection.selected.length > 0">
        <span>{{ selection.selected.length }} items selected</span>
        <button mat-button (click)="clearSelection()">Clear</button>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table mat-table 
               [dataSource]="data" 
               class="data-table"
               matSort
               (matSortChange)="onSortChange($event)">
          
          <!-- Selection Column -->
          <ng-container matColumnDef="select" *ngIf="selectable">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox 
                (change)="$event ? masterToggle() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox 
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Data Columns -->
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
            <th mat-header-cell 
                *matHeaderCellDef 
                [mat-sort-header]="column.sortable ? column.key : ''"
                [style.width]="column.width">
              {{ column.label }}
            </th>
            <td mat-cell *matCellDef="let row" [style.width]="column.width">
              <ng-container [ngSwitch]="column.type">
                <!-- Text -->
                <span *ngSwitchCase="'text'">{{ getValue(row, column.key) }}</span>
                
                <!-- Number -->
                <span *ngSwitchCase="'number'">{{ getValue(row, column.key) | number }}</span>
                
                <!-- Date -->
                <span *ngSwitchCase="'date'">{{ getValue(row, column.key) | date:'dd/MM/yyyy HH:mm' }}</span>
                
                <!-- Boolean -->
                <mat-icon *ngSwitchCase="'boolean'" 
                          [class]="getValue(row, column.key) ? 'text-success' : 'text-danger'">
                  {{ getValue(row, column.key) ? 'check_circle' : 'cancel' }}
                </mat-icon>
                
                <!-- Actions -->
                <div *ngSwitchCase="'actions'" class="row-actions">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="actionMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <ng-container *ngFor="let action of rowActions">
                      <button mat-menu-item 
                              (click)="onAction(action.action, row)"
                              [disabled]="action.disabled ? action.disabled(row) : false">
                        <mat-icon>{{ action.icon }}</mat-icon>
                        <span>{{ action.label }}</span>
                      </button>
                    </ng-container>
                  </mat-menu>
                </div>
                
                <!-- Custom Template -->
                <ng-container *ngSwitchCase="'custom'">
                  <ng-container *ngTemplateOutlet="column.template; context: { $implicit: row, column: column }">
                  </ng-container>
                </ng-container>
                
                <!-- Default -->
                <span *ngSwitchDefault>{{ getValue(row, column.key) }}</span>
              </ng-container>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row 
              *matRowDef="let row; columns: displayedColumns;" 
              class="table-row"
              [class.selected]="selection.isSelected(row)"
              (click)="onRowClick(row)">
          </tr>
        </table>
      </div>

      <!-- No Data -->
      <div class="no-data" *ngIf="data.length === 0 && !loading">
        <mat-icon>inbox</mat-icon>
        <p>{{ noDataMessage || 'Không có dữ liệu' }}</p>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>Đang tải...</p>
      </div>

      <!-- Paginator -->
      <mat-paginator 
        *ngIf="pageable"
        [length]="totalCount"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        [pageSizeOptions]="pageSizeOptions"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .table-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-title h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .table-count {
      color: #666;
      font-size: 14px;
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-field {
      width: 250px;
    }

    .selection-info {
      padding: 8px 24px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-wrapper {
      max-height: 600px;
      overflow: auto;
    }

    .data-table {
      width: 100%;
    }

    .row-actions {
      display: flex;
      justify-content: center;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .table-row.selected {
      background-color: #e3f2fd;
    }

    .no-data {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .loading {
      text-align: center;
      padding: 48px 24px;
    }

    .text-success {
      color: #4caf50;
    }

    .text-danger {
      color: #f44336;
    }

    .mat-mdc-paginator {
      border-top: 1px solid #e0e0e0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() loading = false;
  @Input() pageable = true;
  @Input() selectable = false;
  @Input() searchable = true;
  @Input() showToolbar = true;
  
  @Input() title = '';
  @Input() noDataMessage = '';
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50, 100];
  @Input() searchTerm = '';
  
  @Input() rowActions: TableAction[] = [];
  @Input() globalActions: TableAction[] = [];

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() search = new EventEmitter<string>();
  @Output() action = new EventEmitter<TableEvent>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  displayedColumns: string[] = [];
  selection = new SelectionModel<any>(true, []);

  ngOnInit() {
    this.updateDisplayedColumns();
    
    this.selection.changed.subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  private updateDisplayedColumns() {
    this.displayedColumns = [];
    
    if (this.selectable) {
      this.displayedColumns.push('select');
    }
    
    this.displayedColumns.push(...this.columns.map(col => col.key));
  }

  getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], row);
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }

  onSearch(event: any) {
    const value = event.target.value;
    this.search.emit(value);
  }

  onAction(action: string, row?: any) {
    this.action.emit({ action, row, rows: this.selection.selected });
  }

  onRowClick(row: any) {
    if (!this.selectable) {
      this.rowClick.emit(row);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() 
      ? this.selection.clear() 
      : this.data.forEach(row => this.selection.select(row));
  }

  clearSelection() {
    this.selection.clear();
  }
}
