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
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';

import { Search, Add, Edit, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchStaff, createStaff, updateStaff, deleteStaff } from '@/store/slices/staffSlice';
import { RootState, AppDispatch } from '@/store/store';
import { Staff, StaffRole, Department } from '@/services/staffService';

const schema = yup.object().shape({
  employeeId: yup.string().required('Employee ID is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  role: yup.string().required('Role is required'),
  department: yup.string().required('Department is required'),
  specialization: yup.string(),
  qualifications: yup.string(),
  licenseNumber: yup.string(),
  dateOfBirth: yup.string(),
  hireDate: yup.string(),
  salary: yup.number().positive(),
  shiftStart: yup.string(),
  shiftEnd: yup.string(),
  isActive: yup.boolean(),
});

const StaffManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { staff, loading } = useSelector((state: RootState) => state.staff);
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  const handleOpenDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      reset(staffMember);
    } else {
      setEditingStaff(null);
      reset({
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStaff(null);
    reset({});
  };

  const onSubmit = async (data: Staff) => {
    try {
      if (editingStaff) {
        await dispatch(updateStaff({ id: editingStaff.id!, data })).unwrap();
        enqueueSnackbar('Staff member updated successfully', { variant: 'success' });
      } else {
        await dispatch(createStaff(data)).unwrap();
        enqueueSnackbar('Staff member created successfully', { variant: 'success' });
      }
      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await dispatch(deleteStaff(id)).unwrap();
        enqueueSnackbar('Staff member deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete staff member', { variant: 'error' });
      }
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
    const matchesDepartment = departmentFilter === 'ALL' || member.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleColor = (role: StaffRole) => {
    const colors: Record<StaffRole, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      DOCTOR: 'primary',
      NURSE: 'secondary',
      RECEPTIONIST: 'info',
      ADMINISTRATOR: 'warning',
      LAB_TECHNICIAN: 'success',
      PHARMACIST: 'error',
    };
    return colors[role] || 'default';
  };

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Staff Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ fontWeight: 600 }}
          >
            Add Staff Member
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'border' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              {Object.values(StaffRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              {Object.values(Department).map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'border' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'muted.DEFAULT' }}>
                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {member.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {member.firstName} {member.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={member.role} size="small" color={getRoleColor(member.role)} />
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>{member.specialization || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">{member.email}</Typography>
                        <Typography variant="caption">{member.phoneNumber}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={member.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(member)} color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(member.id!)}
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
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  {...register('employeeId')}
                  fullWidth
                  label="Employee ID"
                  error={!!errors.employeeId}
                  helperText={errors.employeeId?.message}
                />
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
                  <TextField
                    {...register('phoneNumber')}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Role"
                        error={!!errors.role}
                        helperText={errors.role?.message}
                      >
                        {Object.values(StaffRole).map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Department"
                        error={!!errors.department}
                        helperText={errors.department?.message}
                      >
                        {Object.values(Department).map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('specialization')}
                    fullWidth
                    label="Specialization"
                    placeholder="e.g., Cardiology, Surgery"
                  />
                  <TextField
                    {...register('licenseNumber')}
                    fullWidth
                    label="License Number"
                  />
                </Box>
                <TextField
                  {...register('qualifications')}
                  fullWidth
                  label="Qualifications"
                  multiline
                  rows={2}
                  placeholder="e.g., MBBS, MD"
                />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('dateOfBirth')}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    {...register('hireDate')}
                    fullWidth
                    label="Hire Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    {...register('shiftStart')}
                    fullWidth
                    label="Shift Start Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    {...register('shiftEnd')}
                    fullWidth
                    label="Shift End Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <TextField
                  {...register('salary')}
                  fullWidth
                  label="Salary"
                  type="number"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active Status"
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingStaff ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default StaffManagement;