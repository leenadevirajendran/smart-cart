package com.smartcart.repository;

import com.smartcart.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    //Find Cart by Buyer's Email
    Optional<Cart> findByBuyerEmail(String email);

}
