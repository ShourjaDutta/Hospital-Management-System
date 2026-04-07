package com.hms.inventory.service;

import com.hms.inventory.model.MedicalItem;
import com.hms.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void testAddItem() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setName("Paracetamol");
        item.setCategory(MedicalItem.ItemCategory.MEDICATION);
        item.setCurrentStock(100);
        item.setUnitPrice(new BigDecimal("5.50"));

        when(inventoryRepository.findByItemCode(any())).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(MedicalItem.class))).thenReturn(item);

        // Execute
        MedicalItem result = inventoryService.addItem(item);

        // Verify
        assertNotNull(result);
        assertEquals("Paracetamol", result.getName());
        verify(inventoryRepository, times(1)).save(item);
    }

    @Test
    void testGetAllItems() {
        // Setup
        MedicalItem item1 = new MedicalItem();
        item1.setName("Paracetamol");
        item1.setCurrentStock(100);

        MedicalItem item2 = new MedicalItem();
        item2.setName("Bandages");
        item2.setCurrentStock(50);

        List<MedicalItem> items = Arrays.asList(item1, item2);
        when(inventoryRepository.findAll()).thenReturn(items);

        // Execute
        List<MedicalItem> result = inventoryService.getAllItems();

        // Verify
        assertEquals(2, result.size());
        verify(inventoryRepository, times(1)).findAll();
    }

    @Test
    void testGetItemById_Found() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setName("Paracetamol");

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(item));

        // Execute
        Optional<MedicalItem> result = inventoryService.getItemById("123");

        // Verify
        assertTrue(result.isPresent());
        assertEquals("Paracetamol", result.get().getName());
    }

    @Test
    void testGetItemById_NotFound() {
        // Setup
        when(inventoryRepository.findById("999")).thenReturn(Optional.empty());

        // Execute
        Optional<MedicalItem> result = inventoryService.getItemById("999");

        // Verify
        assertFalse(result.isPresent());
    }

    @Test
    void testUpdateItem() {
        // Setup
        MedicalItem existingItem = new MedicalItem();
        existingItem.setId("123");
        existingItem.setName("Old Name");
        existingItem.setCurrentStock(50);

        MedicalItem updateData = new MedicalItem();
        updateData.setName("New Name");
        updateData.setCurrentStock(100);

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(existingItem));
        when(inventoryRepository.save(any(MedicalItem.class))).thenReturn(updateData);

        // Execute
        MedicalItem result = inventoryService.updateItem("123", updateData);

        // Verify
        assertEquals("New Name", result.getName());
        assertEquals(100, result.getCurrentStock());
        verify(inventoryRepository, times(1)).save(any(MedicalItem.class));
    }

    @Test
    void testUpdateStock() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(50);

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(item));
        when(inventoryRepository.save(any(MedicalItem.class))).thenReturn(item);

        // Execute
        MedicalItem result = inventoryService.updateStock("123", 200);

        // Verify
        assertEquals(200, result.getCurrentStock());
        verify(inventoryRepository, times(1)).save(item);
    }

    @Test
    void testRestockItem() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(50);
        item.setMaximumStock(1000);

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(item));
        when(inventoryRepository.save(any(MedicalItem.class))).thenReturn(item);

        // Execute
        MedicalItem result = inventoryService.restockItem("123", 100);

        // Verify
        assertEquals(150, result.getCurrentStock()); // 50 + 100 = 150
        verify(inventoryRepository, times(1)).save(item);
    }

    @Test
    void testConsumeItem() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(100);

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(item));
        when(inventoryRepository.save(any(MedicalItem.class))).thenReturn(item);

        // Execute
        MedicalItem result = inventoryService.consumeItem("123", 30);

        // Verify
        assertEquals(70, result.getCurrentStock()); // 100 - 30 = 70
        verify(inventoryRepository, times(1)).save(item);
    }

    @Test
    void testConsumeItem_InsufficientStock() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(10); // Only 10 in stock

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(item));

        // Execute & Verify
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> inventoryService.consumeItem("123", 30)); // Trying to consume 30

        assertEquals("Insufficient stock. Available: 10", exception.getMessage());
        verify(inventoryRepository, never()).save(any(MedicalItem.class));
    }

    @Test
    void testGetLowStockItems() {
        // Setup
        MedicalItem lowStockItem = new MedicalItem();
        lowStockItem.setName("Low Stock Item");
        lowStockItem.setCurrentStock(5); // Below threshold

        List<MedicalItem> lowStockItems = Arrays.asList(lowStockItem);
        when(inventoryRepository.findLowStockItems(10)).thenReturn(lowStockItems);

        // Execute
        List<MedicalItem> result = inventoryService.getLowStockItems();

        // Verify
        assertEquals(1, result.size());
        assertEquals("Low Stock Item", result.get(0).getName());
    }

    @Test
    void testDeleteItem() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");

        when(inventoryRepository.findById("123")).thenReturn(Optional.of(item));
        doNothing().when(inventoryRepository).delete(item);

        // Execute
        inventoryService.deleteItem("123");

        // Verify
        verify(inventoryRepository, times(1)).delete(item);
    }
}