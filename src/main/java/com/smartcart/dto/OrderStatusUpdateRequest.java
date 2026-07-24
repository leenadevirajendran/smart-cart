package com.smartcart.dto;

import com.smartcart.model.Order;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private Order.OrderStatus status;
}