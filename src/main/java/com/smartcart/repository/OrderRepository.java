package com.smartcart.repository;

import com.smartcart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {


    // Get all Orders for a specific buyer
    List<Order> findByBuyerEmailOrderByCreatedAtDesc(String email);

    // Get all orders containing products from a specific seller
    List<Order> findByOrderItems_Product_SellerEmail(String sellerEmail);
    }

