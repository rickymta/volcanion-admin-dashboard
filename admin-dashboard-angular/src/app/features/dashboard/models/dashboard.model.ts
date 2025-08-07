export interface DashboardCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface SystemStatus {
  name: string;
  value: number;
}

export interface QuickAction {
  label: string;
  icon: string;
  color: string;
  action: string;
}
