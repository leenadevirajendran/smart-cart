package com.smartcart.controller;

import com.smartcart.model.Product;
import com.smartcart.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // Public — anyone browsing can see what's trending
    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrending(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(recommendationService.getTrendingProducts(limit));
    }

    // Public — related products for a given product detail page
    @GetMapping("/related/{productId}")
    public ResponseEntity<List<Product>> getRelated(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(recommendationService.getRelatedProducts(productId, limit));
    }

    // Requires login — personalized to the logged-in buyer
    @GetMapping("/for-you")
    public ResponseEntity<List<Product>> getPersonalized(
            @RequestParam(defaultValue = "8") int limit) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(recommendationService.getPersonalizedRecommendations(email, limit));
    }
}