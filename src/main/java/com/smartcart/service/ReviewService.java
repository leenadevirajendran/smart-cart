package com.smartcart.service;

import com.smartcart.model.Order;
import com.smartcart.model.Product;
import com.smartcart.model.Review;
import com.smartcart.model.User;
import com.smartcart.repository.OrderRepository;
import com.smartcart.repository.ReviewRepository;
import com.smartcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final OrderRepository orderRepository;

    public Review addReview(String buyerEmail, Long productId, Integer rating, String comment) {

        //Get the Buyer
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //Get the product
        Product product = productService.getProductById(productId);

        // Check if buyer already reviewed this product
        if (reviewRepository.existsByBuyerIdAndProductId(buyer.getId(), productId)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        //Check if the buyer has already purchased the product
        boolean hasPurchased = orderRepository
                .findByBuyerEmailOrderByCreatedAtDesc(buyerEmail)
                .stream()
                .anyMatch(order ->
                        order.getStatus() != Order.OrderStatus.CANCELLED &&
                                order.getOrderItems().stream()
                                        .anyMatch(item -> item.getProduct().getId().equals(productId))
                );
        Review review = new Review();
        review.setBuyer(buyer);
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(comment);
        review.setVerifiedPurchase(hasPurchased);
        return reviewRepository.save(review);

    }

    // Get all reviews for a product
    public List<Review> getProductReviews(Long productId){
        return reviewRepository.findByProductId(productId);
    }

    // Get average rating for a product
    public Double getAverageRating(Long productId){
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        return avg != null ? Math.round(avg * 10.0)/10.0 : 0;

    }
    //Get total review count
    public Long getReviewCount(Long productId){
        return reviewRepository.countByProductId(productId);
    }

    // Delete review — only the buyer who wrote it can delete
    public void deleteReview(Long reviewID, String buyerEmail){
        Review review = reviewRepository.findById(reviewID)
                .orElseThrow(()->new RuntimeException("Review not found"));
    if (!review.getBuyer().getEmail().equals(buyerEmail)){
        throw new RuntimeException("Yo can only delete your own reviews");
    }
    reviewRepository.delete(review);
    }


    }


