package com.hms.inventory.controller;

import com.hms.inventory.model.MedicalItem;
import com.hms.inventory.service.InventoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<?> addItem(@RequestBody MedicalItem item) {
        try {
            MedicalItem savedItem = inventoryService.addItem(item);
            return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error adding item: {}", e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<MedicalItem>> getAllItems() {
        List<MedicalItem> items = inventoryService.getAllItems();
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalItem> getItemById(@PathVariable String id) {
        Optional<MedicalItem> item = inventoryService.getItemById(id);
        return item.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/code/{itemCode}")
    public ResponseEntity<MedicalItem> getItemByCode(@PathVariable String itemCode) {
        Optional<MedicalItem> item = inventoryService.getItemByCode(itemCode);
        return item.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MedicalItem>> getItemsByCategory(@PathVariable String category) {
        try {
            MedicalItem.ItemCategory categoryEnum = MedicalItem.ItemCategory.valueOf(category.toUpperCase());
            List<MedicalItem> items = inventoryService.getItemsByCategory(categoryEnum);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MedicalItem>> getItemsByStatus(@PathVariable String status) {
        try {
            MedicalItem.ItemStatus statusEnum = MedicalItem.ItemStatus.valueOf(status.toUpperCase());
            List<MedicalItem> items = inventoryService.getItemsByStatus(statusEnum);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<MedicalItem>> getLowStockItems() {
        List<MedicalItem> items = inventoryService.getLowStockItems();
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @GetMapping("/critical-stock")
    public ResponseEntity<List<MedicalItem>> getCriticalStockItems() {
        List<MedicalItem> items = inventoryService.getCriticalStockItems();
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicalItem>> searchItemsByName(@RequestParam String name) {
        List<MedicalItem> items = inventoryService.searchItemsByName(name);
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalItem> updateItem(@PathVariable String id, @RequestBody MedicalItem itemDetails) {
        try {
            MedicalItem updatedItem = inventoryService.updateItem(id, itemDetails);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<MedicalItem> updateStock(@PathVariable String id, @RequestParam Integer stock) {
        try {
            MedicalItem updatedItem = inventoryService.updateStock(id, stock);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/restock")
    public ResponseEntity<MedicalItem> restockItem(@PathVariable String id, @RequestParam Integer quantity) {
        try {
            MedicalItem updatedItem = inventoryService.restockItem(id, quantity);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/consume")
    public ResponseEntity<MedicalItem> consumeItem(@PathVariable String id, @RequestParam Integer quantity) {
        try {
            MedicalItem updatedItem = inventoryService.consumeItem(id, quantity);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        try {
            inventoryService.deleteItem(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}