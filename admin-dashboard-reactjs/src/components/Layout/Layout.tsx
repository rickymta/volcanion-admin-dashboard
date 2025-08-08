import React, { ReactNode, useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CloudQueue as ServicesIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Person,
  ExitToApp,
  Notifications,
  Api as ApiIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import useTokenRefresh from '../../hooks/useTokenRefresh';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Services', icon: <ServicesIcon />, path: '/services' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'API Versioning Demo', icon: <ApiIcon />, path: '/api-versioning-demo' },
  { text: 'API Connection Tester', icon: <ApiIcon />, path: '/api-connection-tester' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState(5); // Mock notification count
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  
  // Initialize token refresh monitoring
  useTokenRefresh();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileAction = (action: string) => {
    handleProfileMenuClose();
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        dispatch(logoutUser());
        break;
      default:
        break;
    }
  };

  const handleNotificationAction = (action: string, notificationId?: number) => {
    switch (action) {
      case 'mark_read':
        if (notificationId) {
          console.log(`Mark notification ${notificationId} as read`);
          // Update notification count
          setNotificationCount(prev => Math.max(0, prev - 1));
        }
        break;
      case 'clear_all':
        console.log('Clear all notifications');
        setNotificationCount(0);
        handleNotificationMenuClose();
        break;
      case 'view_all':
        console.log('View all notifications');
        handleNotificationMenuClose();
        break;
      default:
        break;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Volcanion Admin
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Volcanion Microservices Admin Dashboard
          </Typography>
          
          {/* User Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <ThemeToggle variant="icon" />
            <IconButton 
              color="inherit" 
              sx={{ mr: 1, ml: 1 }}
              onClick={handleNotificationMenuOpen}
            >
              <Badge 
                badgeContent={notificationCount} 
                color="error"
                max={99}
                invisible={notificationCount === 0}
              >
                <Notifications />
              </Badge>
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'secondary.main',
                  mr: 1 
                }}
              >
                {user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}` : 'U'}
              </Avatar>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'User' : 'User'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight="bold">
            {user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'User' : 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || 'user@volcanion.com'}
          </Typography>
        </Box>
        <MenuItem onClick={() => handleProfileAction('profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem onClick={() => handleProfileAction('settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <MenuItem onClick={() => handleProfileAction('logout')}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
      
      {/* Notification Dropdown Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" fontWeight="bold">
            Notifications ({notificationCount})
          </Typography>
          {notificationCount > 0 && (
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNotificationAction('clear_all')}
            >
              Clear All
            </Typography>
          )}
        </Box>
        
        {notificationCount === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <>
            {/* Mock notifications */}
            <MenuItem onClick={() => handleNotificationAction('mark_read', 1)}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  New user registered
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Jane Smith just signed up • 2 mins ago
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleNotificationAction('mark_read', 2)}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  Service Alert
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Auth service is running slow • 5 mins ago
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleNotificationAction('mark_read', 3)}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  System Update
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Scheduled maintenance completed • 1 hour ago
                </Typography>
              </Box>
            </MenuItem>
            
            {notificationCount > 3 && (
              <Box sx={{ px: 2, py: 1, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography 
                  variant="body2" 
                  color="primary" 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleNotificationAction('view_all')}
                >
                  View all {notificationCount} notifications
                </Typography>
              </Box>
            )}
          </>
        )}
      </Menu>
      
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
