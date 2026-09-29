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
    private final ProductSimilarityService productSimilarityService;

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

    // Personalized: ranks the catalog against a TF-IDF "taste profile" built by
    // averaging the vectors of everything this buyer has purchased before.
    // Falls back to trending for buyers with no usable purchase history.
    public List<Product> getPersonalizedRecommendations(String buyerEmail, int limit) {
        List<Long> purchasedProductIds = orderItemRepository.findPurchasedProductIdsByBuyer(buyerEmail);

        List<Product> personalized = productSimilarityService
                .getPersonalizedSimilarProducts(purchasedProductIds, limit);

        if (personalized.isEmpty()) {
            return getTrendingProducts(limit);
        }
        return personalized;
    }
}