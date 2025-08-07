import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <mat-card>
          <mat-card-header>
            <div class="header-content">
              <mat-icon class="logo-icon">dashboard</mat-icon>
              <div class="header-text">
                <mat-card-title>Admin Dashboard</mat-card-title>
                <mat-card-subtitle>Đăng nhập vào hệ thống</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tên đăng nhập</mat-label>
                <input matInput 
                       formControlName="username" 
                       placeholder="Nhập tên đăng nhập"
                       autocomplete="username">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Tên đăng nhập là bắt buộc
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mật khẩu</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password" 
                       placeholder="Nhập mật khẩu"
                       autocomplete="current-password">
                <button mat-icon-button 
                        matSuffix 
                        (click)="hidePassword = !hidePassword"
                        type="button">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Mật khẩu là bắt buộc
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  Mật khẩu phải có ít nhất 6 ký tự
                </mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="loginForm.invalid || loading"
                        class="login-button">
                  <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                  <span *ngIf="!loading">Đăng nhập</span>
                </button>
              </div>

              <div class="form-footer">
                <a mat-button color="primary" routerLink="/auth/register">
                  Chưa có tài khoản? Đăng ký ngay
                </a>
                <a mat-button color="primary" routerLink="/auth/forgot-password">
                  Quên mật khẩu?
                </a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .logo-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #3f51b5;
    }

    .header-text {
      flex: 1;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    mat-card-subtitle {
      font-size: 14px;
      color: #666;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      margin: 24px 0 16px 0;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      position: relative;
    }

    .login-button mat-spinner {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .form-footer {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }

    .form-footer a {
      font-size: 14px;
    }

    mat-card {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
    }

    mat-card-content {
      padding: 24px;
    }

    mat-card-header {
      padding: 24px 24px 0 24px;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .login-card {
        max-width: 100%;
      }
      
      mat-card-content {
        padding: 16px;
      }
      
      mat-card-header {
        padding: 16px 16px 0 16px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Check if already logged in
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Đăng nhập thành công!', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.message || 'Đăng nhập thất bại. Vui lòng thử lại.', 
            'Đóng', 
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }
}
