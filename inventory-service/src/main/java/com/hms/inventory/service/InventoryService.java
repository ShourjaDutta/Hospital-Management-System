package com.hms.inventory.service;

import com.hms.inventory.model.MedicalItem;
import com.hms.inventory.repository.InventoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public MedicalItem addItem(MedicalItem item) {
        log.info("Adding new medical item: {}", item.getName());


        if (item.getItemCode() == null || item.getItemCode().isEmpty()) {
            item.setItemCode(generateItemCode(item.getCategory()));
        }

        // Check if item code already exists
        if (inventoryRepository.findByItemCode(item.getItemCode()).isPresent()) {
            throw new RuntimeException("Item with code " + item.getItemCode() + " already exists");
        }

        return inventoryRepository.save(item);
    }

    private String generateItemCode(MedicalItem.ItemCategory category) {
        String prefix = switch (category) {
            case MEDICATION -> "MED";
            case EQUIPMENT -> "EQP";
            case SUPPLY -> "SUP";
            case LAB_SUPPLY -> "LAB";
            case SURGICAL -> "SUR";
        };

        long count = inventoryRepository.count();
        return prefix + String.format("%04d", count + 1);
    }

    public List<MedicalItem> getAllItems() {
        return inventoryRepository.findAll();
    }

    public Optional<MedicalItem> getItemById(String id) {
        return inventoryRepository.findById(id);
    }

    public Optional<MedicalItem> getItemByCode(String itemCode) {
        return inventoryRepository.findByItemCode(itemCode);
    }

    public List<MedicalItem> getItemsByCategory(MedicalItem.ItemCategory category) {
        return inventoryRepository.findByCategory(category);
    }

    public List<MedicalItem> getItemsByStatus(MedicalItem.ItemStatus status) {
        return inventoryRepository.findByStatus(status);
    }

    public List<MedicalItem> getLowStockItems() {
        return inventoryRepository.findLowStockItems(10); // threshold of 10
    }

    public List<MedicalItem> searchItemsByName(String name) {
        return inventoryRepository.findByNameContaining(name);
    }

    public MedicalItem updateItem(String id, MedicalItem itemDetails) {
        log.info("Updating medical item with ID: {}", id);

        MedicalItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical item not found with id: " + id));

        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());
        item.setCategory(itemDetails.getCategory());
        item.setCurrentStock(itemDetails.getCurrentStock());
        item.setMinimumStock(itemDetails.getMinimumStock());
        item.setMaximumStock(itemDetails.getMaximumStock());
        item.setUnit(itemDetails.getUnit());
        item.setUnitPrice(itemDetails.getUnitPrice());
        item.setSupplier(itemDetails.getSupplier());
        item.setStorageLocation(itemDetails.getStorageLocation());

        return inventoryRepository.save(item);
    }

    public MedicalItem updateStock(String id, Integer newStock) {
        log.info("Updating stock for item ID: {} to {}", id, newStock);

        MedicalItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical item not found with id: " + id));

        item.setCurrentStock(newStock);
        return inventoryRepository.save(item);
    }

    public MedicalItem restockItem(String id, Integer quantity) {
        log.info("Restocking item ID: {} with quantity: {}", id, quantity);

        MedicalItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical item not found with id: " + id));

        int newStock = item.getCurrentStock() + quantity;
        if (newStock > item.getMaximumStock()) {
            throw new RuntimeException("Restock quantity exceeds maximum stock limit");
        }

        item.setCurrentStock(newStock);
        return inventoryRepository.save(item);
    }

    public MedicalItem consumeItem(String id, Integer quantity) {
        log.info("Consuming {} units of item ID: {}", quantity, id);

        MedicalItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical item not found with id: " + id));

        if (item.getCurrentStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + item.getCurrentStock());
        }

        item.setCurrentStock(item.getCurrentStock() - quantity);
        return inventoryRepository.save(item);
    }

    public void deleteItem(String id) {
        log.info("Deleting medical item with ID: {}", id);

        MedicalItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical item not found with id: " + id));

        inventoryRepository.delete(item);
    }

    public List<MedicalItem> getCriticalStockItems() {
        return inventoryRepository.findByStatus(MedicalItem.ItemStatus.LOW_STOCK);
    }
}