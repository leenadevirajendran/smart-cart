package com.smartcart.repository;

import com.smartcart.model.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlashSaleRepository extends JpaRepository<FlashSale , Long> {

    // Get all currently active flash sales (within time window)
    List<FlashSale> findByActiveTrueAndEndTimeAfter( LocalDateTime now);

    // Find flash sale for a specific product (if one is running)
    Optional<FlashSale> findByProductIdAndActiveTrue(Long productId);
}
