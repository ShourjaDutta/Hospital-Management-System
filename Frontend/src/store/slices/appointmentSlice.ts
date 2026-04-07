import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService, Appointment, AppointmentStatus } from '@/services/appointmentService';

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async () => {
  const response = await appointmentService.getAllAppointments();
  return response.data;
});

export const fetchUpcomingAppointments = createAsyncThunk('appointments/fetchUpcoming', async () => {
  const response = await appointmentService.getUpcomingAppointments();
  return response.data;
});

export const createAppointment = createAsyncThunk('appointments/create', async (data: Appointment) => {
  const response = await appointmentService.createAppointment(data);
  return response.data;
});

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }: { id: number; status: AppointmentStatus }) => {
    const response = await appointmentService.updateAppointmentStatus(id, status);
    return response.data;
  }
);

export const cancelAppointment = createAsyncThunk('appointments/cancel', async (id: number) => {
  const response = await appointmentService.cancelAppointment(id);
  return response.data;
});

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload);
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const index = state.appointments.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      });
  },
});

export default appointmentSlice.reducer;
