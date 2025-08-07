import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  NetworkCheck as NetworkIcon,
  VpnKey as TokenIcon,
  Person as UserIcon
} from '@mui/icons-material';
import apiManager from '../../api';
import config from '../../config';
import { useAppSelector } from '../../hooks/redux';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

const ApiConnectionTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const { isAuthenticated, accessToken, user } = useAppSelector((state) => state.auth);

  const updateTest = (name: string, status: 'success' | 'error' | 'pending', message: string, details?: any) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, details } : test
    ));
  };

  const initializeTests = () => {
    const initialTests: TestResult[] = [
      { name: 'API Configuration', status: 'pending', message: 'Checking...' },
      { name: 'Network Connectivity', status: 'pending', message: 'Testing connection...' },
      { name: 'Health Check', status: 'pending', message: 'Checking API health...' },
      { name: 'Authentication', status: 'pending', message: 'Testing auth endpoints...' }
    ];
    
    if (isAuthenticated) {
      initialTests.push(
        { name: 'Token Validation', status: 'pending', message: 'Validating current token...' },
        { name: 'Protected Endpoint', status: 'pending', message: 'Testing authenticated request...' },
        { name: 'Token Refresh', status: 'pending', message: 'Testing token refresh...' }
      );
    }
    
    setTests(initialTests);
  };

  const runTests = async () => {
    setTesting(true);
    initializeTests();

    try {
      // Test 1: API Configuration
      updateTest('API Configuration', 'success', 'Configuration loaded', {
        baseURL: config.api.baseURL,
        version: config.api.version,
        versioningEnabled: config.api.versioningEnabled,
        mockAPI: config.api.mockAPI,
        timeout: config.api.timeout
      });

      // Test 2: Network Connectivity
      try {
        const response = await fetch(config.api.baseURL.replace('/api', ''), {
          method: 'HEAD',
          mode: 'cors'
        });
        
        if (response.ok || response.status === 405) { // 405 is also acceptable (method not allowed)
          updateTest('Network Connectivity', 'success', `Server reachable (${response.status})`);
        } else {
          updateTest('Network Connectivity', 'error', `Server returned ${response.status}`);
        }
      } catch (error: any) {
        updateTest('Network Connectivity', 'error', `Connection failed: ${error.message}`);
      }

      // Test 3: Health Check
      try {
        const healthResponse = await apiManager.getClient().get('/health');
        updateTest('Health Check', 'success', 'API is healthy', healthResponse.data);
      } catch (error: any) {
        updateTest('Health Check', 'error', `Health check failed: ${error.message}`, error.response?.data);
      }

      // Test 4: Authentication
      try {
        const testCredentials = { email: 'test@example.com', password: 'wrongpassword' };
        
        if (config.api.mockAPI) {
          updateTest('Authentication', 'success', 'Mock API endpoint available', {
            note: 'Use john.doe@volcanion.com / password123 for mock login'
          });
        } else {
          try {
            await apiManager.auth.login(testCredentials);
            updateTest('Authentication', 'success', 'Auth endpoint reachable');
          } catch (authError: any) {
            if (authError.response?.status === 401 || authError.response?.status === 400) {
              updateTest('Authentication', 'success', 'Auth endpoint working (invalid credentials expected)', authError.response?.data);
            } else {
              updateTest('Authentication', 'error', `Auth endpoint error: ${authError.message}`, authError.response?.data);
            }
          }
        }
      } catch (error: any) {
        updateTest('Authentication', 'error', `Auth test failed: ${error.message}`, error.response?.data);
      }

      // Authenticated user tests
      if (isAuthenticated && accessToken) {
        // Test 5: Token Validation
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp && payload.exp < currentTime;
          
          updateTest('Token Validation', isExpired ? 'error' : 'success', 
            isExpired ? 'Token is expired' : 'Token is valid', {
              expires: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown',
              issued: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown'
            });
        } catch (error) {
          updateTest('Token Validation', 'success', 'Token format valid (mock token)');
        }

        // Test 6: Protected Endpoint
        if (!config.api.mockAPI) {
          try {
            const userResponse = await apiManager.auth.getCurrentUser();
            updateTest('Protected Endpoint', 'success', 'Protected endpoint accessible', userResponse.data);
          } catch (error: any) {
            updateTest('Protected Endpoint', 'error', `Protected endpoint failed: ${error.message}`, error.response?.data);
          }
        } else {
          updateTest('Protected Endpoint', 'success', 'Mock protected endpoint available');
        }

        // Test 7: Token Refresh
        if (!config.api.mockAPI) {
          try {
            const refreshResponse = await apiManager.auth.refreshToken(localStorage.getItem(config.auth.refreshTokenStorageKey) || '');
            updateTest('Token Refresh', 'success', 'Token refresh working', refreshResponse.data);
          } catch (error: any) {
            updateTest('Token Refresh', 'error', `Token refresh failed: ${error.message}`, error.response?.data);
          }
        } else {
          updateTest('Token Refresh', 'success', 'Mock token refresh available');
        }
      }

    } catch (error: any) {
      console.error('Test suite error:', error);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Run tests on component mount
    runTests();
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <SuccessIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'pending': return <CircularProgress size={20} />;
      default: return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success' as const;
      case 'error': return 'error' as const;
      case 'pending': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        API Connection Tester
      </Typography>

      {/* Current Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">API Mode:</Typography>
              <Chip 
                label={config.api.mockAPI ? 'Mock' : 'Real'} 
                color={config.api.mockAPI ? 'warning' : 'primary'}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Authentication:</Typography>
              <Chip 
                label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'} 
                color={isAuthenticated ? 'success' : 'default'}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">API Version:</Typography>
              <Chip label={config.api.version} color="info" size="small" />
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Base URL:</Typography>
              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                {config.api.baseURL}
              </Typography>
            </Grid>
          </Grid>

          {isAuthenticated && user && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">Logged in as:</Typography>
              <Typography variant="body1">
                {user.firstName} {user.lastName} ({user.email})
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Connection Tests</Typography>
            <Button
              variant="contained"
              onClick={runTests}
              disabled={testing}
              startIcon={testing ? <CircularProgress size={20} /> : <NetworkIcon />}
            >
              {testing ? 'Testing...' : 'Run Tests'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          
          {tests.length === 0 ? (
            <Alert severity="info">Click "Run Tests" to start testing API connectivity</Alert>
          ) : (
            <List>
              {tests.map((test, index) => (
                <ListItem key={index} divider={index < tests.length - 1}>
                  <ListItemIcon>
                    {getStatusIcon(test.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{test.name}</Typography>
                        <Chip 
                          label={test.status} 
                          size="small" 
                          color={getStatusColor(test.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {test.message}
                        </Typography>
                        {test.details && (
                          <Box mt={1} p={1} bgcolor="grey.50" borderRadius={1}>
                            <pre style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </Box>
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

export default ApiConnectionTester;
