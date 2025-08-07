import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiRateLimit] = useState('1000');
  const [maxConnections] = useState('500');

  const systemSettings = [
    { label: 'API Rate Limit (requests/minute)', value: apiRateLimit },
    { label: 'Max Concurrent Connections', value: maxConnections },
    { label: 'Session Timeout (minutes)', value: '30' },
    { label: 'Log Retention (days)', value: '30' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" paragraph>
        Configure system preferences and operational settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                }
                label="Enable Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                  />
                }
                label="Auto Backup"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
              
              <Box mt={2}>
                <Button variant="contained" startIcon={<SaveIcon />}>
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              
              <List>
                {systemSettings.map((setting, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={setting.label}
                        secondary={`Current: ${setting.value}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="edit">
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < systemSettings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Database Configuration
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Database Host"
                  defaultValue="localhost"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Database Port"
                  defaultValue="5432"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Database Name"
                  defaultValue="volcanion_db"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Connection Pool Size"
                  defaultValue="20"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Box mt={2}>
              <Button variant="contained" color="primary">
                Test Connection
              </Button>
              <Button variant="outlined" sx={{ ml: 1 }}>
                Save Configuration
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="JWT Secret Expiry (hours)"
                  defaultValue="24"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Password Min Length"
                  defaultValue="8"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  defaultValue="5"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Box mt={2}>
              <Button variant="contained" color="secondary">
                Update Security Settings
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
