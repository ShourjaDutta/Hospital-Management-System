package com.hms.inventory.repository;

import com.hms.inventory.model.MedicalItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
public class InventoryRepositoryTest {

    @Autowired
    private InventoryRepository inventoryRepository;

    @BeforeEach  // ✅ Add this method
    void setUp() {
        // Clean database before each test to prevent duplicate data
        inventoryRepository.deleteAll();
    }

    @Test
    void testSaveAndFindItem() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setName("Test Item");
        item.setItemCode("TEST001");
        item.setCategory(MedicalItem.ItemCategory.MEDICATION);
        item.setCurrentStock(100);

        // Execute - Save
        MedicalItem saved = inventoryRepository.save(item);

        // Execute - Find
        Optional<MedicalItem> found = inventoryRepository.findById(saved.getId());

        // Verify
        assertTrue(found.isPresent());
        assertEquals("Test Item", found.get().getName());
        assertEquals("TEST001", found.get().getItemCode());
    }

    @Test
    void testFindByItemCode() {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setName("Test Item");
        item.setItemCode("UNIQUE001");
        item.setCategory(MedicalItem.ItemCategory.MEDICATION);
        inventoryRepository.save(item);

        // Execute
        Optional<MedicalItem> found = inventoryRepository.findByItemCode("UNIQUE001");

        // Verify
        assertTrue(found.isPresent());
        assertEquals("UNIQUE001", found.get().getItemCode());
    }

    @Test
    void testFindByCategory() {
        // Setup
        MedicalItem item1 = new MedicalItem();
        item1.setName("Medicine");
        item1.setItemCode("MED001");  // ✅ Add unique item codes
        item1.setCategory(MedicalItem.ItemCategory.MEDICATION);
        inventoryRepository.save(item1);

        MedicalItem item2 = new MedicalItem();
        item2.setName("Equipment");
        item2.setItemCode("EQP001");  // ✅ Add unique item codes
        item2.setCategory(MedicalItem.ItemCategory.EQUIPMENT);
        inventoryRepository.save(item2);

        // Execute
        List<MedicalItem> medications = inventoryRepository.findByCategory(MedicalItem.ItemCategory.MEDICATION);

        // Verify
        assertFalse(medications.isEmpty());
        assertTrue(medications.stream().allMatch(item ->
                item.getCategory() == MedicalItem.ItemCategory.MEDICATION));
    }

    @Test
    void testFindLowStockItems() {
        // Setup
        MedicalItem lowStockItem = new MedicalItem();
        lowStockItem.setName("Low Stock");
        lowStockItem.setItemCode("LOW001");  // ✅ Add unique item code
        lowStockItem.setCurrentStock(5); // Low stock
        inventoryRepository.save(lowStockItem);

        MedicalItem normalStockItem = new MedicalItem();
        normalStockItem.setName("Normal Stock");
        normalStockItem.setItemCode("NRM001");  // ✅ Add unique item code
        normalStockItem.setCurrentStock(50); // Normal stock
        inventoryRepository.save(normalStockItem);

        // Execute
        List<MedicalItem> lowStockItems = inventoryRepository.findLowStockItems(10);

        // Verify
        assertFalse(lowStockItems.isEmpty());
        assertTrue(lowStockItems.stream().anyMatch(item ->
                item.getName().equals("Low Stock")));
    }
}