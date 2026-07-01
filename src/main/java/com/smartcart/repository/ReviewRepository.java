package com.smartcart.repository;

import com.smartcart.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review,Long> {

    //Get all reviews for a product
    List<Review> findByProductId(Long productId);

    // Check if buyer already reviewed this product
    boolean existsByBuyerIdAndProductId(Long buyer_id,Long product_id);

    //Get Specific review by buyer and product
    Optional<Review> findByBuyerIdAndProductId(Long buyer_id, Long product_id);

    // Calculate average rating for a product
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId ")
    Double findAverageRatingByProductId(@Param("productId")Long product_id);

    long countByProductId(Long productId);



}



