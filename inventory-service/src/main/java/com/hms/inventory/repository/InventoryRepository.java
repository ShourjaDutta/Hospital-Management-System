package com.hms.inventory.repository;

import com.hms.inventory.model.MedicalItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<MedicalItem, String> {
    Optional<MedicalItem> findByItemCode(String itemCode);
    List<MedicalItem> findByCategory(MedicalItem.ItemCategory category);
    List<MedicalItem> findByStatus(MedicalItem.ItemStatus status);
    List<MedicalItem> findBySupplier(String supplier);

    @Query("{ 'currentStock': { $lte: ?0 } }")
    List<MedicalItem> findLowStockItems(Integer threshold);

    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<MedicalItem> findByNameContaining(String name);
}