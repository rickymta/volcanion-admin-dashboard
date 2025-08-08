import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateUser } from '../../store/slices/authSlice';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    first_name: user?.first_name || 'John',
    last_name: user?.last_name || 'Doe',
    email: user?.email || 'john.doe@volcanion.com',
    phone: '+1 (555) 123-4567',
    gender: user?.gender || 'Male',
    date_of_birth: user?.date_of_birth || '1990-01-01',
    location: 'San Francisco, CA',
    joinDate: '2023-01-15',
  });

  const [editedInfo, setEditedInfo] = useState(userInfo);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      const updatedInfo = {
        first_name: user.first_name ?? 'John',
        last_name: user.last_name ?? 'Doe',
        email: user.email ?? '',
        phone: '+1 (555) 123-4567',
        gender: (user.gender ?? 'other').toString(),
        date_of_birth: user.date_of_birth ? (typeof user.date_of_birth === 'string' ? user.date_of_birth : user.date_of_birth.toISOString().slice(0, 10)) : '1990-01-01',
        location: userInfo.location,
        joinDate: userInfo.joinDate,
      };
      setUserInfo(updatedInfo);
      setEditedInfo(updatedInfo);
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo(userInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(userInfo);
  };

  const handleSave = () => {
    setUserInfo(editedInfo);
    setIsEditing(false);
    
    // Update Redux state
    dispatch(updateUser({
      first_name: editedInfo.first_name,
      last_name: editedInfo.last_name,
      email: editedInfo.email,
      gender: (editedInfo.gender as 'male' | 'female' | 'other'),
      date_of_birth: typeof editedInfo.date_of_birth === 'string' ? new Date(editedInfo.date_of_birth) : editedInfo.date_of_birth,
    }));
    
    console.log('Profile updated:', editedInfo);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" paragraph color="text.secondary">
        Manage your personal information and account settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {userInfo.first_name?.[0] ?? ''}{userInfo.last_name?.[0] ?? ''}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 0,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {userInfo.first_name} {userInfo.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userInfo.gender}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {typeof userInfo.date_of_birth === 'string' ? userInfo.date_of_birth : userInfo.date_of_birth?.toISOString().slice(0, 10)}
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Info
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Member since:
                </Typography>
                <Typography variant="body2">
                  {new Date(userInfo.joinDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last login:
                </Typography>
                <Typography variant="body2">
                  Today, 10:30 AM
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Typography variant="body2" color="success.main">
                  Active
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button
                      startIcon={<SaveIcon />}
                      variant="contained"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      variant="outlined"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={isEditing ? editedInfo.first_name : userInfo.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={isEditing ? editedInfo.last_name : userInfo.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={isEditing ? editedInfo.email : userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedInfo.phone : userInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={isEditing ? editedInfo.gender : userInfo.gender}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={isEditing ? editedInfo.date_of_birth : userInfo.date_of_birth}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={isEditing ? editedInfo.location : userInfo.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth>
                    Change Password
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth>
                    Two-Factor Authentication
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth>
                    Login Sessions
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth>
                    API Keys
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
