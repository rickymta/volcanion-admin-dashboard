import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Auth routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  
  // Main app routes with layout
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['users.read'] }
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['roles.read'] }
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: 'config',
            loadComponent: () => import('./features/settings/system-config.component').then(m => m.SystemConfigComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['config.read'] }
          },
          {
            path: 'logs',
            loadComponent: () => import('./features/settings/system-config.component').then(m => m.SystemConfigComponent),
            canActivate: [RoleGuard],
            data: { permissions: ['logs.read'] }
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },
  
  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  
  // Wildcard route
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
