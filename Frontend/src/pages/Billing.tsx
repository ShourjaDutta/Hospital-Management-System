import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  Refresh, 
  Payment, 
  Warning, 
  Add, 
  Edit, 
  Delete, 
  AttachMoney,
  Receipt 
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchBills, createBill, updateBill, deleteBill } from '@/store/slices/billingSlice';
import { fetchPatients } from '@/store/slices/patientSlice';
import { RootState, AppDispatch } from '@/store/store';
import { BillStatus, PaymentMethod, billingService, Bill } from '@/services/billingService';

const billSchema = yup.object().shape({
  patientId: yup.number().required('Patient is required'),
  appointmentId: yup.number(),
  billAmount: yup.number().positive().required('Bill amount is required'),
  billDate: yup.string().required('Bill date is required'),
  dueDate: yup.string().required('Due date is required'),
  itemizedCharges: yup.string(),
  notes: yup.string(),
});

const Billing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bills, loading } = useSelector((state: RootState) => state.billing);
  const { patients } = useSelector((state: RootState) => state.patients);
  const { enqueueSnackbar } = useSnackbar();
  
  const [updatingOverdue, setUpdatingOverdue] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [billDialog, setBillDialog] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedBill, setSelectedBill] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientTotalDue, setPatientTotalDue] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(billSchema),
  });

  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleUpdateOverdue = async () => {
    setUpdatingOverdue(true);
    try {
      await billingService.updateOverdueBills();
      enqueueSnackbar('Overdue bills updated successfully', { variant: 'success' });
      dispatch(fetchBills());
    } catch (error) {
      enqueueSnackbar('Failed to update overdue bills', { variant: 'error' });
    } finally {
      setUpdatingOverdue(false);
    }
  };

  const handleOpenPaymentDialog = (billId: number, dueAmount: number) => {
    setSelectedBill(billId);
    setPaymentAmount(dueAmount.toString());
    setPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialog(false);
    setSelectedBill(null);
    setPaymentAmount('');
    setPaymentMethod(PaymentMethod.CASH);
  };

  const handleMakePayment = async () => {
    if (!selectedBill) return;
    
    try {
      await billingService.makePayment(selectedBill, parseFloat(paymentAmount), paymentMethod);
      enqueueSnackbar('Payment processed successfully', { variant: 'success' });
      handleClosePaymentDialog();
      dispatch(fetchBills());
    } catch (error) {
      enqueueSnackbar('Failed to process payment', { variant: 'error' });
    }
  };

  const handleOpenBillDialog = (bill?: Bill) => {
    if (bill) {
      setEditingBill(bill);
      reset(bill);
    } else {
      setEditingBill(null);
      reset({});
    }
    setBillDialog(true);
  };

  const handleCloseBillDialog = () => {
    setBillDialog(false);
    setEditingBill(null);
    reset({});
  };

  const onSubmitBill = async (data: Bill) => {
    try {
      if (editingBill) {
        await dispatch(updateBill({ id: editingBill.id!, data })).unwrap();
        enqueueSnackbar('Bill updated successfully', { variant: 'success' });
      } else {
        await dispatch(createBill(data)).unwrap();
        enqueueSnackbar('Bill created successfully', { variant: 'success' });
      }
      handleCloseBillDialog();
    } catch (error) {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const handleDeleteBill = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await dispatch(deleteBill(id)).unwrap();
        enqueueSnackbar('Bill deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete bill', { variant: 'error' });
      }
    }
  };

  const handleGetPatientTotalDue = async (patientId: number) => {
    try {
      const response = await billingService.getTotalDue(patientId);
      setPatientTotalDue(response.data);
      setSelectedPatientId(patientId);
    } catch (error) {
      enqueueSnackbar('Failed to fetch total due', { variant: 'error' });
    }
  };

  const getStatusColor = (status?: BillStatus) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PARTIALLY_PAID':
        return 'info';
      case 'OVERDUE':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredBills = bills.filter((bill) => {
    if (statusFilter === 'ALL') return true;
    return bill.status === statusFilter;
  });

  const overdueBillsCount = bills.filter(bill => bill.status === 'OVERDUE').length;
  const totalRevenue = bills
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + (b.billAmount || 0), 0);
  const totalOutstanding = bills
    .filter(b => b.status !== 'PAID' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (b.dueAmount || 0), 0);

  const displayBills = tabValue === 0 ? filteredBills : bills.filter(b => b.status === 'OVERDUE');

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Billing & Payments
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {overdueBillsCount > 0 && (
              <Chip
                icon={<Warning />}
                label={`${overdueBillsCount} Overdue`}
                color="error"
                variant="outlined"
              />
            )}
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleUpdateOverdue}
              disabled={updatingOverdue}
              sx={{ fontWeight: 600 }}
            >
              {updatingOverdue ? 'Updating...' : 'Update Overdue'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenBillDialog()}
              sx={{ fontWeight: 600 }}
            >
              Create Bill
            </Button>
          </Box>
        </Box>

        {/* Summary Cards - Fixed Grid */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoney color="success" />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ${totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Receipt color="warning" />
                  <Typography variant="h6">Outstanding</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  ${totalOutstanding.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Warning color="error" />
                  <Typography variant="h6">Overdue Bills</Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {overdueBillsCount}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filter and Tabs */}
        <Paper elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'border' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Bills" />
              <Tab label={`Overdue (${overdueBillsCount})`} />
            </Tabs>
          </Box>
          <Box sx={{ p: 2 }}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              {Object.values(BillStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'border' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'muted.DEFAULT' }}>
                <TableCell sx={{ fontWeight: 600 }}>Bill ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bill Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Paid Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bill Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : displayBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No bills found
                  </TableCell>
                </TableRow>
              ) : (
                displayBills.map((bill) => {
                  const patient = patients.find(p => p.id === bill.patientId);
                  return (
                    <TableRow key={bill.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          #{bill.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {patient ? `${patient.firstName} ${patient.lastName}` : `ID: ${bill.patientId}`}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => handleGetPatientTotalDue(bill.patientId)}
                            sx={{ p: 0, fontSize: '0.75rem' }}
                          >
                            View Total Due
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>${bill.billAmount?.toFixed(2)}</TableCell>
                      <TableCell>${bill.paidAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={bill.dueAmount && bill.dueAmount > 0 ? 'error.main' : 'text.primary'}
                        >
                          ${bill.dueAmount?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={bill.status} size="small" color={getStatusColor(bill.status)} />
                      </TableCell>
                      <TableCell>
                        {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenBillDialog(bill)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && bill.dueAmount && bill.dueAmount > 0 && (
                          <Tooltip title="Make Payment">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenPaymentDialog(bill.id!, bill.dueAmount!)}
                            >
                              <Payment fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBill(bill.id!)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Make Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <MenuItem value={PaymentMethod.CASH}>Cash</MenuItem>
                <MenuItem value={PaymentMethod.CREDIT_CARD}>Credit Card</MenuItem>
                <MenuItem value={PaymentMethod.DEBIT_CARD}>Debit Card</MenuItem>
                <MenuItem value={PaymentMethod.INSURANCE}>Insurance</MenuItem>
                <MenuItem value={PaymentMethod.ONLINE}>Online</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClosePaymentDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleMakePayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              Process Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create/Edit Bill Dialog */}
        <Dialog open={billDialog} onClose={handleCloseBillDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit(onSubmitBill)}>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {editingBill ? 'Edit Bill' : 'Create New Bill'}
            </DialogTitle>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    {...register('billAmount')}
                    fullWidth
                    label="Bill Amount"
                    type="number"
                    error={!!errors.billAmount}
                    helperText={errors.billAmount?.message}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                  <TextField
                    {...register('appointmentId')}
                    fullWidth
                    label="Appointment ID (Optional)"
                    type="number"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    {...register('billDate')}
                    fullWidth
                    label="Bill Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.billDate}
                    helperText={errors.billDate?.message}
                  />
                  <TextField
                    {...register('dueDate')}
                    fullWidth
                    label="Due Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dueDate}
                    helperText={errors.dueDate?.message}
                  />
                </Box>
                <TextField
                  {...register('itemizedCharges')}
                  fullWidth
                  label="Itemized Charges"
                  multiline
                  rows={3}
                  placeholder="E.g., Consultation: $100, Lab Tests: $50"
                />
                <TextField
                  {...register('notes')}
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseBillDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingBill ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Patient Total Due Dialog */}
        {patientTotalDue !== null && (
          <Dialog open={true} onClose={() => setPatientTotalDue(null)} maxWidth="xs" fullWidth>
            <DialogTitle>Patient Total Due</DialogTitle>
            <DialogContent>
              <Typography variant="h4" fontWeight={700} color="error.main" align="center">
                ${patientTotalDue.toFixed(2)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPatientTotalDue(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Billing;