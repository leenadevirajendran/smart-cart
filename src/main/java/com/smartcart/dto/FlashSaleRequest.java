package com.smartcart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FlashSaleRequest {

    @NotNull
    private Long productId;

    @Positive
    private BigDecimal flashPrice;

    @Positive
    private Integer totalStock;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;



}
