package com.hms.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.inventory.model.MedicalItem;
import com.hms.inventory.service.InventoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
public class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryService inventoryService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddItem() throws Exception {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setName("Paracetamol");
        item.setCategory(MedicalItem.ItemCategory.MEDICATION);
        item.setCurrentStock(100);

        when(inventoryService.addItem(any(MedicalItem.class))).thenReturn(item);

        // Execute & Verify
        mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(item)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.name").value("Paracetamol"));
    }

    @Test
    void testGetAllItems() throws Exception {
        // Setup
        MedicalItem item1 = new MedicalItem();
        item1.setId("123");
        item1.setName("Paracetamol");

        MedicalItem item2 = new MedicalItem();
        item2.setId("124");
        item2.setName("Bandages");

        List<MedicalItem> items = Arrays.asList(item1, item2);
        when(inventoryService.getAllItems()).thenReturn(items);

        // Execute & Verify
        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Paracetamol"))
                .andExpect(jsonPath("$[1].name").value("Bandages"));
    }

    @Test
    void testGetItemById_Found() throws Exception {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setName("Paracetamol");

        when(inventoryService.getItemById("123")).thenReturn(Optional.of(item));

        // Execute & Verify
        mockMvc.perform(get("/api/inventory/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.name").value("Paracetamol"));
    }

    @Test
    void testGetItemById_NotFound() throws Exception {
        // Setup
        when(inventoryService.getItemById("999")).thenReturn(Optional.empty());

        // Execute & Verify
        mockMvc.perform(get("/api/inventory/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateItem() throws Exception {
        // Setup
        MedicalItem updatedItem = new MedicalItem();
        updatedItem.setName("Updated Name");
        updatedItem.setCurrentStock(200);

        when(inventoryService.updateItem(any(String.class), any(MedicalItem.class))).thenReturn(updatedItem);

        // Execute & Verify
        mockMvc.perform(put("/api/inventory/123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedItem)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void testUpdateStock() throws Exception {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(150);

        when(inventoryService.updateStock("123", 150)).thenReturn(item);

        // Execute & Verify
        mockMvc.perform(patch("/api/inventory/123/stock")
                        .param("stock", "150"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(150));
    }

    @Test
    void testRestockItem() throws Exception {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(150);

        when(inventoryService.restockItem("123", 50)).thenReturn(item);

        // Execute & Verify
        mockMvc.perform(post("/api/inventory/123/restock")
                        .param("quantity", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(150));
    }

    @Test
    void testConsumeItem() throws Exception {
        // Setup
        MedicalItem item = new MedicalItem();
        item.setId("123");
        item.setCurrentStock(70);

        when(inventoryService.consumeItem("123", 30)).thenReturn(item);

        // Execute & Verify
        mockMvc.perform(post("/api/inventory/123/consume")
                        .param("quantity", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(70));
    }

    @Test
    void testGetLowStockItems() throws Exception {
        // Setup
        MedicalItem lowStockItem = new MedicalItem();
        lowStockItem.setId("123");
        lowStockItem.setName("Low Stock Item");
        lowStockItem.setCurrentStock(5);

        List<MedicalItem> lowStockItems = Arrays.asList(lowStockItem);
        when(inventoryService.getLowStockItems()).thenReturn(lowStockItems);

        // Execute & Verify
        mockMvc.perform(get("/api/inventory/low-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Low Stock Item"));
    }

    @Test
    void testDeleteItem() throws Exception {
        // Execute & Verify
        mockMvc.perform(delete("/api/inventory/123"))
                .andExpect(status().isNoContent());
    }
}