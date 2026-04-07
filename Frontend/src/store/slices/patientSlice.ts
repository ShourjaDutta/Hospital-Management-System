import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { patientService, Patient } from '@/services/patientService';

interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk('patients/fetchAll', async () => {
  const response = await patientService.getAllPatients();
  return response.data;
});

export const fetchPatientById = createAsyncThunk('patients/fetchById', async (id: number) => {
  const response = await patientService.getPatientById(id);
  return response.data;
});

export const createPatient = createAsyncThunk('patients/create', async (data: Patient) => {
  const response = await patientService.createPatient(data);
  return response.data;
});

export const updatePatient = createAsyncThunk('patients/update', async ({ id, data }: { id: number; data: Patient }) => {
  const response = await patientService.updatePatient(id, data);
  return response.data;
});

export const deletePatient = createAsyncThunk('patients/delete', async (id: number) => {
  await patientService.deletePatient(id);
  return id;
});

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patients';
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload);
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearCurrentPatient } = patientSlice.actions;
export default patientSlice.reducer;
