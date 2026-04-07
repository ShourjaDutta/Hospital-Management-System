import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { MedicalServices, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { setCredentials } from '@/store/slices/authSlice';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginForm = {
  email: string;
  password: string;
};

// Mock users for demonstration
const MOCK_USERS = [
  { email: 'admin@hospital.com', password: 'admin123', name: 'Dr. Admin', role: 'ADMIN' as const, id: '1' },
  { email: 'doctor@hospital.com', password: 'doctor123', name: 'Dr. Smith', role: 'DOCTOR' as const, id: '2' },
  { email: 'nurse@hospital.com', password: 'nurse123', name: 'Nurse Johnson', role: 'NURSE' as const, id: '3' },
];

const Login = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    
    // Mock authentication
    const user = MOCK_USERS.find((u) => u.email === data.email && u.password === data.password);
    
    if (user) {
      const token = 'mock-jwt-token-' + Date.now();
      dispatch(
        setCredentials({
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
          token,
        })
      );
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background',
        backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <MedicalServices sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                HealthCare HMS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hospital Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3, p: 2, bgcolor: 'info', borderRadius: 2, border: '1px solid', borderColor: 'border' }}>
              <Typography variant="caption" display="block" fontWeight={600} gutterBottom>
                Demo Accounts:
              </Typography>
              <Typography variant="caption" display="block">
                Admin: admin@hospital.com / admin123
              </Typography>
              <Typography variant="caption" display="block">
                Doctor: doctor@hospital.com / doctor123
              </Typography>
              <Typography variant="caption" display="block">
                Nurse: nurse@hospital.com / nurse123
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('email')}
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
              />
              <TextField
                {...register('password')}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
