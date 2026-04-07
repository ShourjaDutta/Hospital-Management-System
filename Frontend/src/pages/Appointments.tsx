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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';

import { Add, Schedule } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  fetchAppointments,
  createAppointment,
  updateAppointmentStatus,
} from '@/store/slices/appointmentSlice';
import { fetchPatients } from '@/store/slices/patientSlice';
import { fetchActiveDoctors } from '@/store/slices/staffSlice';
import { RootState, AppDispatch } from '@/store/store';
import { Appointment, AppointmentStatus } from '@/services/appointmentService';
import { Department } from '@/services/staffService';

const schema = yup.object().shape({
  patientId: yup.number().required('Patient is required'),
  doctorId: yup.number().required('Doctor is required'),
  appointmentDateTime: yup.string().required('Date and time is required'),
  durationMinutes: yup.number().positive().integer(),
  reason: yup.string(),
  department: yup.string(),
});

const Appointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { patients } = useSelector((state: RootState) => state.patients);
  const { doctors } = useSelector((state: RootState) => state.staff);
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      durationMinutes: 30,
    },
  });

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchPatients());
    dispatch(fetchActiveDoctors());
  }, [dispatch]);

  const handleOpenDialog = () => {
    reset({
      durationMinutes: 30,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset({});
  };

  const onSubmit = async (data: Appointment) => {
    try {
      await dispatch(createAppointment(data)).unwrap();
      enqueueSnackbar('Appointment created successfully', { variant: 'success' });
      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar('Failed to create appointment', { variant: 'error' });
    }
  };

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      await dispatch(updateAppointmentStatus({ id, status })).unwrap();
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const getStatusColor = (status?: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Appointments
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{ fontWeight: 600 }}
          >
            Book Appointment
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'border' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'muted.DEFAULT' }}>
                <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => {
                  const patient = patients.find((p) => p.id === appointment.patientId);
                  const doctor = doctors.find((d) => d.id === appointment.doctorId);
                  return (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        {patient ? `${patient.firstName} ${patient.lastName}` : `ID: ${appointment.patientId}`}
                      </TableCell>
                      <TableCell>
                        {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : `ID: ${appointment.doctorId}`}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          {new Date(appointment.appointmentDateTime).toLocaleString()}
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.durationMinutes || 30} min</TableCell>
                      <TableCell>{appointment.department || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={getStatusColor(appointment.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={appointment.status || 'SCHEDULED'}
                          onChange={(e) =>
                            handleStatusChange(appointment.id!, e.target.value as AppointmentStatus)
                          }
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                          <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="COMPLETED">Completed</MenuItem>
                          <MenuItem value="CANCELLED">Cancelled</MenuItem>
                          <MenuItem value="NO_SHOW">No Show</MenuItem>  
                        </TextField>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle sx={{ fontWeight: 700 }}>Book New Appointment</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Patient"
                      error={!!errors.patientId}
                      helperText={errors.patientId?.message}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Doctor"
                      error={!!errors.doctorId}
                      helperText={errors.doctorId?.message}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('appointmentDateTime')}
                    fullWidth
                    label="Date & Time"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.appointmentDateTime}
                    helperText={errors.appointmentDateTime?.message}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    {...register('durationMinutes')}
                    fullWidth
                    label="Duration (min)"
                    type="number"
                    error={!!errors.durationMinutes}
                    helperText={errors.durationMinutes?.message}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Department">
                      {Object.values(Department).map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <TextField {...register('reason')} fullWidth label="Reason for Visit" multiline rows={3} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                Book Appointment
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Appointments;
