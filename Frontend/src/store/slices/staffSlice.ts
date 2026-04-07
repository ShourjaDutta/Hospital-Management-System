import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffService, Staff } from '@/services/staffService';

interface StaffState {
  staff: Staff[];
  currentStaff: Staff | null;
  doctors: Staff[];
  loading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  staff: [],
  currentStaff: null,
  doctors: [],
  loading: false,
  error: null,
};

export const fetchStaff = createAsyncThunk('staff/fetchAll', async () => {
  const response = await staffService.getAllStaff();
  return response.data;
});

export const fetchActiveDoctors = createAsyncThunk('staff/fetchActiveDoctors', async () => {
  const response = await staffService.getActiveDoctors();
  return response.data;
});

export const createStaff = createAsyncThunk('staff/create', async (data: Staff) => {
  const response = await staffService.createStaff(data);
  return response.data;
});

export const updateStaff = createAsyncThunk(
  'staff/update',
  async ({ id, data }: { id: number; data: Staff }) => {
    const response = await staffService.updateStaff(id, data);
    return response.data;
  }
);

export const deleteStaff = createAsyncThunk('staff/delete', async (id: number) => {
  await staffService.deleteStaff(id);
  return id;
});

export const updateStaffStatus = createAsyncThunk(
  'staff/updateStatus',
  async ({ id, active }: { id: number; active: boolean }) => {
    const response = await staffService.updateStaffStatus(id, active);
    return response.data;
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch staff';
      })
      
      // Fetch active doctors
      .addCase(fetchActiveDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
      })
      
      // Create staff
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staff.push(action.payload);
      })
      
      // Update staff
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      
      // Delete staff
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter((s) => s.id !== action.payload);
      })
      
      // Update staff status
      .addCase(updateStaffStatus.fulfilled, (state, action) => {
        const index = state.staff.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      });
  },
});

export default staffSlice.reducer;