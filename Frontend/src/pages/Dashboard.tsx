import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { People, CalendarMonth, Receipt, Warning, CheckCircle } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchPatients } from '@/store/slices/patientSlice';
import { fetchUpcomingAppointments } from '@/store/slices/appointmentSlice';
import { fetchActiveDoctors } from '@/store/slices/staffSlice';
import { fetchBills } from '@/store/slices/billingSlice';
import { fetchInventory, fetchLowStockItems } from '@/store/slices/inventorySlice';
import { RootState, AppDispatch } from '@/store/store';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  // selectors (adjust paths if your slices use different names)
  const patients = useSelector((state: RootState) => state.patients.patients || []);
  const appointments = useSelector((state: RootState) => state.appointments.appointments || []);
  const doctors = useSelector((state: RootState) => state.staff.doctors || []);
  const bills = useSelector((state: RootState) => state.billing.bills || []);
  const inventoryItems = useSelector((state: RootState) => state.inventory.items || []);

  useEffect(() => {
    // fetch all the data the dashboard needs
    dispatch(fetchPatients());
    dispatch(fetchUpcomingAppointments());
    dispatch(fetchActiveDoctors());
    dispatch(fetchBills());
    dispatch(fetchInventory());
    // optionally fetch low stock specifically
    dispatch(fetchLowStockItems());
  }, [dispatch]);

  // helpers
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const appointmentsToday = useMemo(() => {
    return appointments.filter(a => {
      if (!a.appointmentDateTime) return false;
      return a.appointmentDateTime.split('T')[0] === todayIso;
    });
  }, [appointments, todayIso]);

  const totalPatients = patients.length;

  const activeDoctorsCount = doctors.length;

  const recentAppointments = useMemo(() => {
    // sort descending by datetime (if appointmentDateTime exists) and take top 5
    return [...appointments]
      .sort((a, b) => {
        const ta = a.appointmentDateTime ? new Date(a.appointmentDateTime).getTime() : 0;
        const tb = b.appointmentDateTime ? new Date(b.appointmentDateTime).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 5);
  }, [appointments]);

  const pendingBills = useMemo(() => bills.filter(b => b.status === 'PENDING' || b.status === 'PARTIALLY_PAID'), [bills]);
  const pendingBillsCount = pendingBills.length;
  const totalOutstandingAmount = useMemo(() => {
    return pendingBills.reduce((sum, b) => sum + (Number(b.dueAmount || 0)), 0);
  }, [pendingBills]);

  const paidBills = useMemo(() => bills.filter(b => b.status === 'PAID'), [bills]);
  const totalRevenue = useMemo(() => {
    return paidBills.reduce((sum, b) => sum + (Number(b.billAmount || 0)), 0);
  }, [paidBills]);

  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(it => {
      const current = Number(it.currentStock || 0);
      const min = Number(it.minimumStock || 0);
      return current <= min;
    });
  }, [inventoryItems]);

  const lowStockCount = lowStockItems.length;

  const formatCurrency = (n: number) => {
    return `$${n.toFixed(2)}`;
  };

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      bgcolor: 'primary.main',
    },
    {
      title: "Today's Appointments",
      value: appointmentsToday.length,
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
      bgcolor: 'secondary.main',
    },
    {
      title: 'Pending Bills (count)',
      value: pendingBillsCount,
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      bgcolor: 'warning.main',
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: 'error.main',
      bgcolor: 'error.main',
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Real-time operational insights (data refreshed from the server).
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {stats.map((stat, index) => (
            <Card key={index} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.bgcolor}15`,
                      color: stat.color,
                      display: 'flex',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Appointments
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appointment) => {
                      const patient = patients.find((p) => p.id === appointment.patientId);
                      const doctor = doctors.find((d) => d.id === appointment.doctorId);
                      return (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {patient ? `${patient.firstName} ${patient.lastName}` : `ID: ${appointment.patientId}`}
                          </TableCell>
                          <TableCell>
                            {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : `ID: ${appointment.doctorId}`}
                          </TableCell>
                          <TableCell>{appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status}
                              size="small"
                              color={
                                appointment.status === 'CONFIRMED'
                                  ? 'success'
                                  : appointment.status === 'COMPLETED'
                                  ? 'default'
                                  : 'info'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">No appointments found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Financial Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Revenue</Typography>
                  <Typography variant="h6" fontWeight={600}>{formatCurrency(totalRevenue)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pending Bills (outstanding)</Typography>
                  <Typography variant="h6" fontWeight={600}>{formatCurrency(totalOutstandingAmount)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pending Bills (count)</Typography>
                  <Typography variant="h6" fontWeight={600}>{pendingBillsCount}</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <CheckCircle sx={{ color: 'success.main' }} />
                <Typography variant="body2">All systems operational</Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
