package com.hms.inventory.model;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "medical_items")
public class MedicalItem {

    public enum ItemCategory {
        MEDICATION, EQUIPMENT, SUPPLY, LAB_SUPPLY, SURGICAL
    }

    public enum ItemStatus {
        AVAILABLE, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED
    }

    @Id
    private String id;

    @Indexed(unique = true)
    private String itemCode;

    private String name;
    private String description;
    private ItemCategory category;
    private ItemStatus status = ItemStatus.AVAILABLE;

    private Integer currentStock = 0;
    private Integer minimumStock = 10;
    private Integer maximumStock = 1000;

    private String unit;
    private BigDecimal unitPrice;
    private String supplier;
    private String storageLocation;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        updateStatus();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateStatus();
    }

    private void updateStatus() {
        if (currentStock <= 0) {
            status = ItemStatus.OUT_OF_STOCK;
        } else if (currentStock <= minimumStock) {
            status = ItemStatus.LOW_STOCK;
        } else {
            status = ItemStatus.AVAILABLE;
        }
    }
}