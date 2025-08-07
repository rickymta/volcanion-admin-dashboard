import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import config, { validateConfig } from '../../config';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

const Settings: React.FC = () => {
  const [configValidation, setConfigValidation] = useState(validateConfig());
  const { mode } = useTheme();
  
  React.useEffect(() => {
    setConfigValidation(validateConfig());
  }, []);

  const ConfigSection: React.FC<{
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        System Configuration
      </Typography>
      
      {/* Configuration Validation */}
      {!configValidation.isValid && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Configuration Errors:
          </Typography>
          {configValidation.errors.map((error, index) => (
            <Typography key={index} variant="body2">• {error}</Typography>
          ))}
        </Alert>
      )}

      {configValidation.isValid && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuration is valid and loaded successfully
        </Alert>
      )}

      {/* Application Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Application Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Name:</Typography>
              <Typography variant="body1">{config.app.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Version:</Typography>
              <Typography variant="body1">{config.app.version}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Company:</Typography>
              <Typography variant="body1">{config.app.companyName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Support:</Typography>
              <Typography variant="body1">{config.app.supportEmail}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <ConfigSection title="API Configuration" icon={<ApiIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="API Base URL"
              value={config.api.baseURL}
              fullWidth
              disabled
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Timeout (ms)"
              value={config.api.timeout}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Retry Attempts"
              value={config.api.retryAttempts}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Retry Delay (ms)"
              value={config.api.retryDelay}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.api.mockAPI} disabled />}
              label="Mock API Mode"
            />
          </Grid>
        </Grid>
      </ConfigSection>

      {/* Authentication Configuration */}
      <ConfigSection title="Authentication Settings" icon={<SecurityIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label="Token Storage Key"
              value={config.auth.tokenStorageKey}
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Refresh Token Key"
              value={config.auth.refreshTokenStorageKey}
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Session Timeout (ms)"
              value={config.auth.sessionTimeout}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Idle Timeout (ms)"
              value={config.auth.idleTimeout}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Max Login Attempts"
              value={config.auth.maxLoginAttempts}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>
      </ConfigSection>

      {/* Feature Flags */}
      <ConfigSection title="Feature Flags" icon={<SettingsIcon />}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.features.debugMode} disabled />}
              label="Debug Mode"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.features.apiLogging} disabled />}
              label="API Logging"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.features.errorReporting} disabled />}
              label="Error Reporting"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.features.analytics} disabled />}
              label="Analytics"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.features.pushNotifications} disabled />}
              label="Push Notifications"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={config.features.serviceWorker} disabled />}
              label="Service Worker"
            />
          </Grid>
        </Grid>
      </ConfigSection>

      {/* UI Configuration */}
      <ConfigSection title="UI Settings" icon={<PaletteIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Theme Settings</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography>Current Mode:</Typography>
              <Chip 
                label={mode === 'dark' ? 'Dark' : 'Light'} 
                color={mode === 'dark' ? 'secondary' : 'primary'}
                size="small"
              />
              <ThemeToggle variant="switch" />
              <ThemeToggle variant="auto" />
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Default Page Size"
              value={config.ui.defaultPageSize}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Max Page Size"
              value={config.ui.maxPageSize}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Default Theme"
              value={config.ui.defaultTheme}
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Primary Color"
              value={config.ui.primaryColor}
              disabled
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: config.ui.primaryColor,
                      borderRadius: '50%',
                      mr: 1,
                      border: '1px solid #ccc'
                    }}
                  />
                )
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Secondary Color"
              value={config.ui.secondaryColor}
              disabled
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: config.ui.secondaryColor,
                      borderRadius: '50%',
                      mr: 1,
                      border: '1px solid #ccc'
                    }}
                  />
                )
              }}
            />
          </Grid>
        </Grid>
      </ConfigSection>

      {/* Notification Settings */}
      <ConfigSection title="Notification Settings" icon={<NotificationsIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label="Notification Timeout (ms)"
              value={config.ui.notificationTimeout}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Max Notifications"
              value={config.ui.maxNotifications}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>
      </ConfigSection>

      {/* Upload Configuration */}
      <ConfigSection title="Upload Settings" icon={<UploadIcon />}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label="Max File Size (bytes)"
              value={config.upload.maxFileSize}
              type="number"
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Upload Endpoint"
              value={config.upload.uploadEndpoint}
              disabled
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Allowed File Types:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {config.upload.allowedFileTypes.map((type, index) => (
                <Chip key={index} label={type} size="small" variant="outlined" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </ConfigSection>

      {/* Environment Variables */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Environment Information
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Variable</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>NODE_ENV</TableCell>
                  <TableCell>{process.env.NODE_ENV}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>REACT_APP_API_URL</TableCell>
                  <TableCell>{process.env.REACT_APP_API_URL || 'Not set'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>REACT_APP_MOCK_API</TableCell>
                  <TableCell>{process.env.REACT_APP_MOCK_API || 'Not set'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>REACT_APP_ENABLE_DEBUG_MODE</TableCell>
                  <TableCell>{process.env.REACT_APP_ENABLE_DEBUG_MODE || 'Not set'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
