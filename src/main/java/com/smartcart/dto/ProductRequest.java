package com.smartcart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Long categoryId;
}
