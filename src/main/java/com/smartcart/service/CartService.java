package com.smartcart.service;

import com.smartcart.model.*;
import com.smartcart.repository.CartRepository;
import com.smartcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    // Get cart for a buyer — create one if it doesn't exist yet
    // This is called "get or create" pattern

    public Cart getOrCreateCart(String buyerEmail) {
        return cartRepository.findByBuyerEmail(buyerEmail)
                .orElseGet(() -> {
                    User buyer = userRepository.findByEmail(buyerEmail)
                            .orElseThrow(() -> new RuntimeException("Usernot Found"));
                    Cart cart = new Cart();
                    cart.setBuyer(buyer);
                    return cartRepository.save(cart);
                });
    }

    //Add a product to the Cart
    public Cart addToCart(String buyerEmail, Long productId, Integer quantity){
        Cart cart = getOrCreateCart(buyerEmail);
        Product product = productService.getProductById(productId);

        //check if the product is in stock
        if (product.getStockQuantity()<quantity){
            throw new RuntimeException("Not enough Stock available");
        }
        // Check if this product already exists in cart
        // If yes — just update the quantity

        Optional<CartItem> existingItem = cart.getItems()
                .stream().filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();
        if(existingItem.isPresent()){
            //Product already in cart — increase quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity()+quantity);
        }else {
            //New Product - add as a new cart item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            // Lock the price at current time
            cartItem.setUnitPrice(product.getPrice());
            cart.getItems().add(cartItem);
        }
        return cartRepository.save(cart);
    }
    // Remove a specific item from cart
    public Cart removeCart(String buyerEmail, Long cartItemId){
        Cart cart = getOrCreateCart(buyerEmail);
        // Remove the item with matching ID from the list
        cart.getItems().removeIf(item-> item.getId().equals(cartItemId));
        return cartRepository.save(cart);
    }
    // Clear the entire cart
    public Cart clearCart(String buyerEmail){
        Cart cart = getOrCreateCart(buyerEmail);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }

    //Get Cart Contents
    public Cart getCart(String buyerEmail){
        return getOrCreateCart(buyerEmail);
    }

    // Update the quantity of a specific cart item
    public Cart updateQuantity(String buyerEmail, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(buyerEmail);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        item.setQuantity(quantity);
        return cartRepository.save(cart);
    }






}
