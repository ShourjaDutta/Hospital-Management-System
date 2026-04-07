import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billingService, Bill } from '@/services/billingService';

interface BillingState {
  bills: Bill[];
  currentBill: Bill | null;
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
};

export const fetchBills = createAsyncThunk('billing/fetchAll', async () => {
  const response = await billingService.getAllBills();
  return response.data;
});

export const fetchBillById = createAsyncThunk('billing/fetchById', async (id: number) => {
  const response = await billingService.getBillById(id);
  return response.data;
});

export const fetchBillsByPatient = createAsyncThunk('billing/fetchByPatient', async (patientId: number) => {
  const response = await billingService.getBillsByPatient(patientId);
  return response.data;
});

export const fetchOverdueBills = createAsyncThunk('billing/fetchOverdue', async () => {
  const response = await billingService.getOverdueBills();
  return response.data;
});

export const createBill = createAsyncThunk('billing/create', async (data: Bill) => {
  const response = await billingService.createBill(data);
  return response.data;
});

export const updateBill = createAsyncThunk(
  'billing/update',
  async ({ id, data }: { id: number; data: Bill }) => {
    const response = await billingService.updateBill(id, data);
    return response.data;
  }
);

export const deleteBill = createAsyncThunk('billing/delete', async (id: number) => {
  await billingService.deleteBill(id);
  return id;
});

export const makePayment = createAsyncThunk(
  'billing/makePayment',
  async ({ id, amount, paymentMethod }: { id: number; amount: number; paymentMethod: string }) => {
    const response = await billingService.makePayment(id, amount, paymentMethod as any);
    return response.data;
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearCurrentBill: (state) => {
      state.currentBill = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bills
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bills';
      })
      
      // Fetch bill by ID
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.currentBill = action.payload;
      })
      
      // Fetch bills by patient
      .addCase(fetchBillsByPatient.fulfilled, (state, action) => {
        state.bills = action.payload;
      })
      
      // Fetch overdue bills
      .addCase(fetchOverdueBills.fulfilled, (state, action) => {
        state.bills = action.payload;
      })
      
      // Create bill
      .addCase(createBill.fulfilled, (state, action) => {
        state.bills.push(action.payload);
      })
      
      // Update bill
      .addCase(updateBill.fulfilled, (state, action) => {
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      
      // Delete bill
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.bills = state.bills.filter((b) => b.id !== action.payload);
      })
      
      // Make payment
      .addCase(makePayment.fulfilled, (state, action) => {
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentBill } = billingSlice.actions;
export default billingSlice.reducer;