// Example of how to use the new API system in React components

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useApi, usePaginatedApi, useAsyncOperation } from '../../hooks/useApi';
import apiManager from '../../api';
import { User } from '../../api/services/userService';

const ApiExamplePage: React.FC = () => {
  // Example 1: Simple API call
  const { 
    data: currentUser, 
    loading: userLoading, 
    error: userError, 
    refetch: refetchUser 
  } = useApi(() => apiManager.users.getProfile());

  // Example 2: Paginated API call
  const {
    data: users,
    pagination,
    loading: usersLoading,
    error: usersError,
    loadMore,
    refresh: refreshUsers,
    setPage,
  } = usePaginatedApi(
    (page, limit) => apiManager.users.getUsers({ page, limit }),
    1,
    5
  );

  // Example 3: Async operation (create, update, delete)
  const {
    loading: updateLoading,
    error: updateError,
    execute: updateUser,
  } = useAsyncOperation((data: { id: string; firstName: string; lastName: string }) =>
    apiManager.users.updateUser(data.id, { firstName: data.firstName, lastName: data.lastName })
  );

  // Example 4: Manual API calls
  const [manualData, setManualData] = useState<any>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const handleManualApiCall = async () => {
    setManualLoading(true);
    try {
      // Get dashboard metrics
      const metricsResponse = await apiManager.analytics.getDashboardMetrics();
      setManualData(metricsResponse.data);
      
      // Get notifications
      const notificationsResponse = await apiManager.notifications.getRecentNotifications(3);
      console.log('Recent notifications:', notificationsResponse.data);
      
      // Mark all notifications as read
      await apiManager.notifications.markAllAsRead();
      
    } catch (error) {
      console.error('Manual API call error:', error);
    } finally {
      setManualLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (currentUser) {
      try {
        await updateUser({
          id: currentUser.id,
          firstName: currentUser.firstName + ' (Updated)',
          lastName: currentUser.lastName,
        });
        
        // Refresh user data after update
        refetchUser();
      } catch (error) {
        console.error('Update failed:', error);
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        API Usage Examples
      </Typography>

      {/* Example 1: Current User */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            1. Current User (useApi hook)
          </Typography>
          
          {userLoading && <CircularProgress />}
          {userError && <Alert severity="error">{userError.message}</Alert>}
          {currentUser && (
            <Box>
              <Typography>Name: {currentUser.firstName} {currentUser.lastName}</Typography>
              <Typography>Email: {currentUser.email}</Typography>
              <Typography>Position: {currentUser.position}</Typography>
              <Box mt={2}>
                <Button onClick={refetchUser} variant="outlined" sx={{ mr: 1 }}>
                  Refresh
                </Button>
                <Button 
                  onClick={handleUpdateUser} 
                  variant="contained"
                  disabled={updateLoading}
                >
                  {updateLoading ? <CircularProgress size={20} /> : 'Update User'}
                </Button>
              </Box>
              {updateError && <Alert severity="error" sx={{ mt: 1 }}>{updateError.message}</Alert>}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Example 2: Users List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            2. Users List (usePaginatedApi hook)
          </Typography>
          
          {usersLoading && users.length === 0 && <CircularProgress />}
          {usersError && <Alert severity="error">{usersError.message}</Alert>}
          
          {users.length > 0 && (
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <Box mt={2}>
                <Button onClick={refreshUsers} variant="outlined" sx={{ mr: 1 }}>
                  Refresh
                </Button>
                <Button 
                  onClick={loadMore} 
                  variant="contained" 
                  disabled={!pagination || pagination.page >= pagination.totalPages}
                >
                  Load More
                </Button>
                {pagination && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Page {pagination.page} of {pagination.totalPages} 
                    ({pagination.total} total items)
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Example 3: Manual API calls */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            3. Manual API Calls
          </Typography>
          
          <Button 
            onClick={handleManualApiCall} 
            variant="contained" 
            disabled={manualLoading}
            sx={{ mb: 2 }}
          >
            {manualLoading ? <CircularProgress size={20} /> : 'Get Dashboard Data'}
          </Button>
          
          {manualData && (
            <Box>
              <Typography variant="subtitle2">Dashboard Metrics:</Typography>
              <Typography>Total Users: {manualData.totalUsers}</Typography>
              <Typography>Active Services: {manualData.activeServices}</Typography>
              <Typography>Total Requests: {manualData.totalRequests}</Typography>
              <Typography>System Health: {manualData.systemHealth}%</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* API Configuration Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Configuration
          </Typography>
          <Typography>Base URL: {apiManager.getConfig().baseURL}</Typography>
          <Typography>Timeout: {apiManager.getConfig().timeout}ms</Typography>
          <Typography>Health Status: <Button onClick={async () => {
            const healthy = await apiManager.healthCheck();
            alert(healthy ? 'API is healthy' : 'API is down');
          }}>Check</Button></Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiExamplePage;
