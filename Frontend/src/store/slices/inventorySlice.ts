import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService, MedicalItem } from '@/services/inventoryService';

interface InventoryState {
  items: MedicalItem[];
  currentItem: MedicalItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk('inventory/fetchAll', async () => {
  const response = await inventoryService.getAllItems();
  return response.data;
});

export const fetchLowStockItems = createAsyncThunk('inventory/fetchLowStock', async () => {
  const response = await inventoryService.getLowStockItems();
  return response.data;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default inventorySlice.reducer;
