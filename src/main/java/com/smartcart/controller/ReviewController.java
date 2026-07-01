package com.smartcart.controller;

import com.smartcart.model.Review;
import com.smartcart.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor

public class ReviewController {

    private final ReviewService reviewService;

    private String getCurrentUserEmail(){
        Authentication auth = SecurityContextHolder.getContext()
                .getAuthentication();
        return auth.getName();
    }

    // Buyer adds a review
    @PostMapping("/product/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Review> addReview(
            @PathVariable Long productId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment){
        return ResponseEntity.ok(
                reviewService.addReview(getCurrentUserEmail(),
                        productId,
                        rating,
                        comment));
    }
    // Anyone can view reviews for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(
            @PathVariable Long productId){
        return ResponseEntity.ok(
                reviewService.getProductReviews(productId));
    }

    //Get Average rating and count for a product
    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<?> getReviewSummary(@PathVariable Long productId){
        return ResponseEntity.ok(Map.of("averageRating",reviewService.getAverageRating(productId),
                "totalReviews",reviewService.getReviewCount(productId)
        ));
    }

        // Buyer deletes their own review
        @DeleteMapping
        @PreAuthorize(("hasRole('BUYER')"))
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewID){
        reviewService.deleteReview(
                reviewID , getCurrentUserEmail());
        return ResponseEntity.ok("Review Deleted Successfully");

        }



}
