package com.smartcart.repository;

import com.smartcart.model.OrderItem;
import com.smartcart.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Ranks products by total quantity sold across all orders — powers "Trending Now"
    @Query("SELECT oi.product FROM OrderItem oi " +
            "WHERE oi.product.active = true " +
            "GROUP BY oi.product " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Product> findTrendingProducts(Pageable pageable);

    // Which categories has this buyer bought from before — powers "For You"
    @Query("SELECT DISTINCT oi.product.category.id FROM OrderItem oi " +
            "WHERE oi.order.buyer.email = :email")
    List<Long> findPurchasedCategoryIdsByBuyer(@Param("email") String email);

    // Which specific products has this buyer already bought — so we don't recommend repeats
    @Query("SELECT DISTINCT oi.product.id FROM OrderItem oi " +
            "WHERE oi.order.buyer.email = :email")
    List<Long> findPurchasedProductIdsByBuyer(@Param("email") String email);
}