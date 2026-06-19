package com.smartcart.repository;

import com.smartcart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    //Get all products by a specific seller
    List<Product> findBySellerId(Long sellerId);

    //Get only active products
    List<Product> findByActiveTrue();

    //Search products by name containing a word
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

}
