package com.smartcart.repository;

import com.smartcart.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // Get all wishlist items for a buyer
    List<Wishlist> findByBuyerEmail(String email);

    // Check if product already in wishlist
    boolean existsByBuyerEmailAndProductId(String buyerEmail, Long productId);

    // Find specific wishlist item
    Optional<Wishlist> findByBuyerEmailAndProductId(String buyerEmail, Long productId);
            
}

