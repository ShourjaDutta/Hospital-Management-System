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
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchInventory } from '@/store/slices/inventorySlice';
import { RootState, AppDispatch } from '@/store/store';
import { ItemCategory, ItemStatus, MedicalItem, inventoryService } from '@/services/inventoryService';

const Inventory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.inventory);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // ========= Modals ========= //
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRestock, setOpenRestock] = useState(false);
  const [openConsume, setOpenConsume] = useState(false);

  const [selectedItem, setSelectedItem] = useState<MedicalItem | null>(null);

  const [newItem, setNewItem] = useState<Partial<MedicalItem>>({});
  const [editItem, setEditItem] = useState<MedicalItem | null>(null);
  const [quantity, setQuantity] = useState(0);

  const getStatusColor = (status?: ItemStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'LOW_STOCK':
        return 'warning';
      case 'OUT_OF_STOCK':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStockPercentage = (current: number = 0, max: number = 100) => {
    return (current / max) * 100;
  };

  const handleEdit = (item: MedicalItem) => {
    setEditItem(item);
    setOpenEdit(true);
  };

  const handleRestock = (item: MedicalItem) => {
    setSelectedItem(item);
    setOpenRestock(true);
  };

  const handleConsume = (item: MedicalItem) => {
    setSelectedItem(item);
    setOpenConsume(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await inventoryService.deleteItem(id);
      dispatch(fetchInventory());
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Inventory Management
          </Typography>

          <Button variant="contained" onClick={() => setOpenCreate(true)}>
            + Add Item
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'border', mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'muted.DEFAULT' }}>
                <TableCell sx={{ fontWeight: 600 }}>Item Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stock Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Loading...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No items found</TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.itemCode}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell><Chip label={item.category} size="small" /></TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 200 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">
                            {item.currentStock} / {item.maximumStock} {item.unit}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Min: {item.minimumStock}
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={getStockPercentage(item.currentStock, item.maximumStock)}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>${item.unitPrice?.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                    </TableCell>

                    {/* ACTION BUTTONS */}
                    <TableCell>
                      <Button size="small" onClick={() => handleEdit(item)}>Edit</Button>
                      <Button size="small" color="success" onClick={() => handleRestock(item)}>Restock</Button>
                      <Button size="small" color="warning" onClick={() => handleConsume(item)}>Consume</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(item.id!)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* CREATE MODAL */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Item Code" margin="dense"
            onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })} />
          <TextField fullWidth label="Name" margin="dense"
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />

          <TextField fullWidth select label="Category" margin="dense"
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}>
            {Object.values(ItemCategory).map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="Minimum Stock" type="number" margin="dense"
            onChange={(e) => setNewItem({ ...newItem, minimumStock: Number(e.target.value) })} />

          <TextField fullWidth label="Maximum Stock" type="number" margin="dense"
            onChange={(e) => setNewItem({ ...newItem, maximumStock: Number(e.target.value) })} />

          <TextField fullWidth label="Unit Price" type="number" margin="dense"
            onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            await inventoryService.createItem(newItem as MedicalItem);
            dispatch(fetchInventory());
            setOpenCreate(false);
          }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" margin="dense"
            value={editItem?.name || ''}
            onChange={(e) => setEditItem({ ...editItem!, name: e.target.value })} />

          <TextField fullWidth label="Supplier" margin="dense"
            value={editItem?.supplier || ''}
            onChange={(e) => setEditItem({ ...editItem!, supplier: e.target.value })} />

          <TextField fullWidth label="Unit Price" type="number" margin="dense"
            value={editItem?.unitPrice || 0}
            onChange={(e) => setEditItem({ ...editItem!, unitPrice: Number(e.target.value) })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            await inventoryService.updateItem(editItem!.id!, editItem!);
            dispatch(fetchInventory());
            setOpenEdit(false);
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* RESTOCK MODAL */}
      <Dialog open={openRestock} onClose={() => setOpenRestock(false)} fullWidth maxWidth="xs">
        <DialogTitle>Restock Item</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="number" label="Quantity to Add"
            onChange={(e) => setQuantity(Number(e.target.value))} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenRestock(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            await inventoryService.restockItem(selectedItem!.id!, quantity);
            dispatch(fetchInventory());
            setOpenRestock(false);
          }}>Restock</Button>
        </DialogActions>
      </Dialog>

      {/* CONSUME MODAL */}
      <Dialog open={openConsume} onClose={() => setOpenConsume(false)} fullWidth maxWidth="xs">
        <DialogTitle>Consume Stock</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="number" label="Quantity to Deduct"
            onChange={(e) => setQuantity(Number(e.target.value))} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenConsume(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={async () => {
            await inventoryService.consumeItem(selectedItem!.id!, quantity);
            dispatch(fetchInventory());
            setOpenConsume(false);
          }}>Consume</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Inventory;
