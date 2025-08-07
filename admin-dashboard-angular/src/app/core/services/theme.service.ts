import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme, AppSettings } from '../models/app.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private readonly SETTINGS_KEY = 'app_settings';
  
  private currentThemeSubject = new BehaviorSubject<Theme>(Theme.LIGHT);
  public currentTheme$ = this.currentThemeSubject.asObservable();
  
  private settingsSubject = new BehaviorSubject<AppSettings>(this.getDefaultSettings());
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
    this.applyTheme(this.currentThemeSubject.value);
  }

  toggleTheme(): void {
    const newTheme = this.currentThemeSubject.value === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    this.updateSettings({ theme });
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  isDarkMode(): boolean {
    return this.currentThemeSubject.value === Theme.DARK;
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const currentSettings = this.settingsSubject.value;
    const newSettings = { ...currentSettings, ...settings };
    this.settingsSubject.next(newSettings);
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
  }

  getSettings(): AppSettings {
    return this.settingsSubject.value;
  }

  private loadSettings(): void {
    // Load theme
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && Object.values(Theme).includes(savedTheme)) {
      this.currentThemeSubject.next(savedTheme);
    }

    // Load settings
    const savedSettings = localStorage.getItem(this.SETTINGS_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings) as AppSettings;
        this.settingsSubject.next({ ...this.getDefaultSettings(), ...settings });
      } catch {
        this.settingsSubject.next(this.getDefaultSettings());
      }
    }
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(`${theme}-theme`);
    
    // Update CSS custom properties
    if (theme === Theme.DARK) {
      body.style.setProperty('--primary-color', '#bb86fc');
      body.style.setProperty('--accent-color', '#03dac6');
      body.style.setProperty('--background-color', '#121212');
      body.style.setProperty('--surface-color', '#1e1e1e');
      body.style.setProperty('--text-color', '#ffffff');
      body.style.setProperty('--text-secondary-color', '#b3b3b3');
    } else {
      body.style.setProperty('--primary-color', '#3f51b5');
      body.style.setProperty('--accent-color', '#ff4081');
      body.style.setProperty('--background-color', '#fafafa');
      body.style.setProperty('--surface-color', '#ffffff');
      body.style.setProperty('--text-color', '#212121');
      body.style.setProperty('--text-secondary-color', '#757575');
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: Theme.LIGHT,
      language: 'en',
      sidebarCollapsed: false,
      notifications: true
    };
  }
}
