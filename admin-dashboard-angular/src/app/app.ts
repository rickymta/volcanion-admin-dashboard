import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'Admin Dashboard';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Initialize theme service
    // The theme service will automatically apply saved theme
  }
}
