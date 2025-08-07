import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/auth.model';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { 'passwordMismatch': true };
  }
  return null;
}

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <div class="register-card">
        <mat-card>
          <mat-card-header>
            <div class="header-content">
              <mat-icon class="logo-icon">dashboard</mat-icon>
              <div class="header-text">
                <mat-card-title>Đăng ký tài khoản</mat-card-title>
                <mat-card-subtitle>Tạo tài khoản mới cho hệ thống</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="name-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Họ</mat-label>
                  <input matInput 
                         formControlName="firstName" 
                         placeholder="Nhập họ">
                  <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                    Họ là bắt buộc
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Tên</mat-label>
                  <input matInput 
                         formControlName="lastName" 
                         placeholder="Nhập tên">
                  <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                    Tên là bắt buộc
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput 
                       type="email"
                       formControlName="email" 
                       placeholder="Nhập địa chỉ email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  Email là bắt buộc
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Email không hợp lệ
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tên đăng nhập</mat-label>
                <input matInput 
                       formControlName="username" 
                       placeholder="Nhập tên đăng nhập">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                  Tên đăng nhập là bắt buộc
                </mat-error>
                <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
                  Tên đăng nhập phải có ít nhất 3 ký tự
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mật khẩu</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password" 
                       placeholder="Nhập mật khẩu">
                <button mat-icon-button 
                        matSuffix 
                        (click)="hidePassword = !hidePassword"
                        type="button">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Mật khẩu là bắt buộc
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Mật khẩu phải có ít nhất 8 ký tự
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                  Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Xác nhận mật khẩu</mat-label>
                <input matInput 
                       [type]="hideConfirmPassword ? 'password' : 'text'"
                       formControlName="confirmPassword" 
                       placeholder="Nhập lại mật khẩu">
                <button mat-icon-button 
                        matSuffix 
                        (click)="hideConfirmPassword = !hideConfirmPassword"
                        type="button">
                  <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Xác nhận mật khẩu là bắt buộc
                </mat-error>
                <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                  Mật khẩu xác nhận không khớp
                </mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="registerForm.invalid || loading"
                        class="register-button">
                  <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                  <span *ngIf="!loading">Đăng ký</span>
                </button>
              </div>

              <div class="form-footer">
                <a mat-button color="primary" routerLink="/auth/login">
                  Đã có tài khoản? Đăng nhập ngay
                </a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 500px;
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

    .name-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }

    .form-actions {
      margin: 24px 0 16px 0;
    }

    .register-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      position: relative;
    }

    .register-button mat-spinner {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .form-footer {
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
      .register-container {
        padding: 16px;
      }
      
      .register-card {
        max-width: 100%;
      }
      
      .name-row {
        flex-direction: column;
        gap: 0;
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit() {
    // Check if already logged in
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const userData: RegisterRequest = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Đăng ký thành công!', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.message || 'Đăng ký thất bại. Vui lòng thử lại.', 
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
