package com.smartcart.repository;

import com.smartcart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> , JpaSpecificationExecutor<Product> {

    List<Product> findByCategoryId(Long categoryId);

    //Get all products by a specific seller
    List<Product> findBySellerId(Long sellerId);

    //Get only active products
    List<Product> findByActiveTrue();

    //Search products by name containing a word
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

}
