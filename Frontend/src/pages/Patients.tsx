import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { Add, Edit, Delete, Search, Email, Phone } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '@/store/slices/patientSlice';
import { RootState, AppDispatch } from '@/store/store';
import { Patient } from '@/services/patientService';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  address: yup.string().required('Address is required'),
  emergencyContact: yup.string().required('Emergency contact is required'),
  bloodType: yup.string().required('Blood type is required'),
  medicalHistory: yup.string(),
  allergies: yup.string(),
  insuranceProvider: yup.string(),
  insuranceNumber: yup.string(),
});

const Patients = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, loading } = useSelector((state: RootState) => state.patients);
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      reset(patient);
    } else {
      setEditingPatient(null);
      reset({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPatient(null);
    reset({});
  };

  const onSubmit = async (data: Patient) => {
    try {
      if (editingPatient) {
        await dispatch(updatePatient({ id: editingPatient.id!, data })).unwrap();
        enqueueSnackbar('Patient updated successfully', { variant: 'success' });
      } else {
        await dispatch(createPatient(data)).unwrap();
        enqueueSnackbar('Patient created successfully', { variant: 'success' });
      }
      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await dispatch(deletePatient(id)).unwrap();
        enqueueSnackbar('Patient deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete patient', { variant: 'error' });
      }
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Patients
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ fontWeight: 600 }}
          >
            Add Patient
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'border' }}>
          <TextField
            fullWidth
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'border' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'muted.DEFAULT' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Blood Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date of Birth</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Insurance</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {patient.firstName} {patient.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{patient.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{patient.phoneNumber}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={patient.bloodType} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{patient.insuranceProvider || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(patient)} color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(patient.id!)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('firstName')}
                    fullWidth
                    label="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                  <TextField
                    {...register('lastName')}
                    fullWidth
                    label="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('email')}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                  <TextField {...register('phoneNumber')} fullWidth label="Phone Number" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('dateOfBirth')}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField {...register('bloodType')} fullWidth label="Blood Type" placeholder="e.g., A+" />
                </Box>
                <TextField {...register('address')} fullWidth label="Address" multiline rows={2} />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField {...register('emergencyContact')} fullWidth label="Emergency Contact" />
                  <TextField {...register('insuranceProvider')} fullWidth label="Insurance Provider" />
                </Box>
                <TextField {...register('insuranceNumber')} fullWidth label="Insurance Number" />
                <TextField
                  {...register('medicalHistory')}
                  fullWidth
                  label="Medical History"
                  multiline
                  rows={3}
                />
                <TextField {...register('allergies')} fullWidth label="Allergies" multiline rows={2} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingPatient ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Patients;
