package com.smartcart.service;

import com.smartcart.model.Product;
import com.smartcart.repository.OrderItemRepository;
import com.smartcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    // Trending: most-sold products overall, by total quantity
    public List<Product> getTrendingProducts(int limit) {
        return orderItemRepository.findTrendingProducts(PageRequest.of(0, limit));
    }

    // Related: other active products in the same category as the given product
    public List<Product> getRelatedProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return productRepository.findByCategoryId(product.getCategory().getId())
                .stream()
                .filter(p -> p.isActive() && !p.getId().equals(productId))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Personalized: products from categories this buyer has purchased before,
    // excluding products they already own. Falls back to trending for new buyers.
    public List<Product> getPersonalizedRecommendations(String buyerEmail, int limit) {
        List<Long> purchasedCategoryIds = orderItemRepository.findPurchasedCategoryIdsByBuyer(buyerEmail);
        List<Long> purchasedProductIds = orderItemRepository.findPurchasedProductIdsByBuyer(buyerEmail);

        if (purchasedCategoryIds.isEmpty()) {
            return getTrendingProducts(limit);
        }

        return purchasedCategoryIds.stream()
                .flatMap(catId -> productRepository.findByCategoryId(catId).stream())
                .filter(p -> p.isActive() && !purchasedProductIds.contains(p.getId()))
                .distinct()
                .limit(limit)
                .collect(Collectors.toList());
    }
}