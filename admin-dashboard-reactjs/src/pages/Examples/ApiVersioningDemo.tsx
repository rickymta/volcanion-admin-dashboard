import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Api as ApiIcon,
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import apiManager from '../../api';
import config from '../../config';

interface ApiCallResult {
  id: string;
  endpoint: string;
  version: string;
  status: 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: string;
}

const ApiVersioningDemo: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>('v1');
  const [customEndpoint, setCustomEndpoint] = useState<string>('/users');
  const [results, setResults] = useState<ApiCallResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const addResult = (result: Omit<ApiCallResult, 'id' | 'timestamp'>) => {
    const newResult: ApiCallResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testDefaultVersion = async () => {
    setLoading(true);
    try {
      const response = await apiManager.versioning.getUsers();
      addResult({
        endpoint: '/users',
        version: `default (${config.api.version})`,
        status: 'success',
        data: response.data
      });
    } catch (error: any) {
      addResult({
        endpoint: '/users',
        version: `default (${config.api.version})`,
        status: 'error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testSpecificVersion = async (version: string) => {
    setLoading(true);
    try {
      const response = await apiManager.versioning.getUsersByVersion(version);
      addResult({
        endpoint: '/users',
        version,
        status: 'success',
        data: response.data
      });
    } catch (error: any) {
      addResult({
        endpoint: '/users',
        version,
        status: 'error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testMixedVersions = async () => {
    setLoading(true);
    try {
      const response = await apiManager.versioning.getDashboardData('v1', 'v2');
      addResult({
        endpoint: 'Mixed: /users (v1) + /analytics/dashboard (v2)',
        version: 'v1, v2',
        status: 'success',
        data: response
      });
    } catch (error: any) {
      addResult({
        endpoint: 'Mixed versions',
        version: 'v1, v2',
        status: 'error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testCustomEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiManager.getClient().get(customEndpoint, {
        version: selectedVersion
      });
      addResult({
        endpoint: customEndpoint,
        version: selectedVersion,
        status: 'success',
        data: response.data
      });
    } catch (error: any) {
      addResult({
        endpoint: customEndpoint,
        version: selectedVersion,
        status: 'error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const changeApiVersion = (version: string) => {
    apiManager.setApiVersion(version);
    setSelectedVersion(version);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        API Versioning Demo
      </Typography>

      {/* Configuration Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Configuration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Base URL:</Typography>
              <Typography variant="body1">{config.api.baseURL}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Default Version:</Typography>
              <Chip 
                label={config.api.version} 
                color="primary" 
                size="small" 
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Versioning Enabled:</Typography>
              <Chip 
                label={config.api.versioningEnabled ? 'Yes' : 'No'} 
                color={config.api.versioningEnabled ? 'success' : 'warning'} 
                size="small" 
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Version Header:</Typography>
              <Typography variant="body1">{config.api.versionHeader}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test API Calls
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={testDefaultVersion}
                disabled={loading}
              >
                Test Default Version
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={testMixedVersions}
                disabled={loading}
              >
                Test Mixed Versions
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => testSpecificVersion('v1')}
                disabled={loading}
              >
                Test v1
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => testSpecificVersion('v2')}
                disabled={loading}
              >
                Test v2
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => testSpecificVersion('v3')}
                disabled={loading}
              >
                Test v3
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Custom Endpoint Test
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Endpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="/users"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Version</InputLabel>
                <Select
                  value={selectedVersion}
                  label="Version"
                  onChange={(e) => setSelectedVersion(e.target.value)}
                >
                  <MenuItem value="v1">v1</MenuItem>
                  <MenuItem value="v2">v2</MenuItem>
                  <MenuItem value="v3">v3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={testCustomEndpoint}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                Test
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Global Version Control */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Global Version Control
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Alert severity="info" icon={<InfoIcon />}>
                Current global API version: <strong>{apiManager.getApiVersion()}</strong>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant={apiManager.getApiVersion() === 'v1' ? 'contained' : 'outlined'}
                    onClick={() => changeApiVersion('v1')}
                  >
                    v1
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant={apiManager.getApiVersion() === 'v2' ? 'contained' : 'outlined'}
                    onClick={() => changeApiVersion('v2')}
                  >
                    v2
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant={apiManager.getApiVersion() === 'v3' ? 'contained' : 'outlined'}
                    onClick={() => changeApiVersion('v3')}
                  >
                    v3
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Call Results
          </Typography>
          
          {results.length === 0 ? (
            <Alert severity="info">No API calls made yet. Try the buttons above!</Alert>
          ) : (
            <List>
              {results.map((result) => (
                <ListItem key={result.id} divider>
                  <ListItemIcon>
                    {result.status === 'success' ? (
                      <SuccessIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography component="code" sx={{ bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1, fontFamily: 'monospace' }}>
                          {result.endpoint}
                        </Typography>
                        <Chip 
                          label={result.version} 
                          size="small" 
                          color={result.status === 'success' ? 'success' : 'error'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {result.timestamp}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        {result.status === 'success' ? (
                          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                            <Typography variant="caption">
                              <strong>Response:</strong>
                            </Typography>
                            <pre style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </Paper>
                        ) : (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            <strong>Error:</strong> {result.error}
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiVersioningDemo;
