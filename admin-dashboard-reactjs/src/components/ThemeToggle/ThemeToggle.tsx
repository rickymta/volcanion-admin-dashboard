import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Brightness6 as AutoModeIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'auto';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  size = 'medium',
  showLabel = false,
}) => {
  const { mode, toggleTheme, setTheme } = useTheme();
  const muiTheme = useMuiTheme();

  // Icon variant - simple toggle button
  if (variant === 'icon') {
    return (
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          size={size}
          sx={{
            transition: 'transform 0.3s ease, color 0.3s ease',
            '&:hover': {
              transform: 'rotate(180deg)',
            },
          }}
        >
          {mode === 'light' ? (
            <DarkModeIcon />
          ) : (
            <LightModeIcon />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  // Switch variant - toggle switch with optional label
  if (variant === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={mode === 'dark'}
            onChange={toggleTheme}
            color="primary"
            size={size === 'large' ? 'medium' : size}
          />
        }
        label={
          showLabel ? (
            <Box display="flex" alignItems="center" gap={1}>
              <LightModeIcon fontSize="small" />
              <Typography variant="body2">
                {mode === 'light' ? 'Light' : 'Dark'}
              </Typography>
              <DarkModeIcon fontSize="small" />
            </Box>
          ) : undefined
        }
      />
    );
  }

  // Auto variant - three-state toggle (future enhancement)
  if (variant === 'auto') {
    return (
      <Tooltip title="Theme mode">
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          size={size}
          sx={{
            borderRadius: '8px',
            padding: '8px',
            background: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            '&:hover': {
              background: muiTheme.palette.action.hover,
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {mode === 'light' ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
            {showLabel && (
              <Typography variant="body2" color="textPrimary">
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Typography>
            )}
          </Box>
        </IconButton>
      </Tooltip>
    );
  }

  return null;
};

// Pre-configured theme toggle components
export const HeaderThemeToggle: React.FC = () => (
  <ThemeToggle variant="icon" size="medium" />
);

export const SettingsThemeToggle: React.FC = () => (
  <ThemeToggle variant="switch" size="medium" showLabel />
);

export const CompactThemeToggle: React.FC = () => (
  <ThemeToggle variant="auto" size="small" showLabel />
);

export default ThemeToggle;
