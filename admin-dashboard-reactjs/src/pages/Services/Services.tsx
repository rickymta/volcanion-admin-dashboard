import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface Service {
  id: number;
  name: string;
  type: string;
  status: 'Running' | 'Stopped' | 'Error';
  port: number;
  uptime: string;
  version: string;
}

const Services: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [services] = useState<Service[]>([
    {
      id: 1,
      name: 'User Service',
      type: 'REST API',
      status: 'Running',
      port: 3001,
      uptime: '2 days 5 hours',
      version: '1.2.0',
    },
    {
      id: 2,
      name: 'Auth Service',
      type: 'gRPC',
      status: 'Running',
      port: 3002,
      uptime: '1 day 12 hours',
      version: '1.0.5',
    },
    {
      id: 3,
      name: 'Payment Service',
      type: 'REST API',
      status: 'Stopped',
      port: 3003,
      uptime: 'N/A',
      version: '0.9.2',
    },
    {
      id: 4,
      name: 'Notification Service',
      type: 'WebSocket',
      status: 'Error',
      port: 3004,
      uptime: 'N/A',
      version: '1.1.0',
    },
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'success';
      case 'Stopped':
        return 'warning';
      case 'Error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Microservices Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Deploy Service
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Uptime</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        color={getStatusColor(service.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{service.port}</TableCell>
                    <TableCell>{service.uptime}</TableCell>
                    <TableCell>{service.version}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="success" title="Start">
                        <PlayIcon />
                      </IconButton>
                      <IconButton size="small" color="error" title="Stop">
                        <StopIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" title="Restart">
                        <RefreshIcon />
                      </IconButton>
                      <IconButton size="small" color="default" title="Settings">
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Deploy New Service</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Service Type"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Port"
            type="number"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Docker Image"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} variant="contained">
            Deploy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services;
