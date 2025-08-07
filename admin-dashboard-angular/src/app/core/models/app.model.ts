export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface AppSettings {
  theme: Theme;
  language: string;
  sidebarCollapsed: boolean;
  notifications: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  permission?: string;
  disabled?: boolean;
}
