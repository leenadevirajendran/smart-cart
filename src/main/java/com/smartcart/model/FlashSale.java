package com.smartcart.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flash_sales")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlashSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which product is on flash sale
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // Special discounted price during the sale
    @Column(name = "flash_price")
    private BigDecimal flashPrice;

    // Total units available for this flash sale
    // This is the STARTING number — the live countdown lives in Redis
    @Column(name = "total_stock")
    private Integer totalStock;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();

    }
}
