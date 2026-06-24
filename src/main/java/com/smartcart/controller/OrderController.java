package com.smartcart.controller;

import com.smartcart.model.Order;
import com.smartcart.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    //Helper Method
    private String getCurrentUserEmail(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // Buyer places an order from their cart
    @PostMapping("/place")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Order> placeOrder(@RequestParam String shippingAddress){
        return ResponseEntity.ok(orderService.placeOrder(getCurrentUserEmail(),shippingAddress));
    }

    // Buyer views all their orders
    @GetMapping("/myorders")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Order>>getBuyerOrders(){
        return ResponseEntity.ok(orderService.getBuyerOrders(getCurrentUserEmail()));
    }

    // Buyer views a single order
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId){
        return ResponseEntity.ok(orderService.getOrderById(orderId,getCurrentUserEmail()));
    }
    // Seller updates order status
    @PutMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId , Order.OrderStatus status){
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId,status,getCurrentUserEmail()));
    }

    // Seller views orders containing their products
    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Order>> getSellerOrders(){
        return ResponseEntity.ok(orderService.getSellerOrders(getCurrentUserEmail()));
    }


}
