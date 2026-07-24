package com.smartcart.controller;

import com.smartcart.model.Cart;
import com.smartcart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;


    //Helper method - reused in every endpoint
    private String getCurrentUserEmail(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    //Get current buyer's cart
    @GetMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> getCart(){
        return ResponseEntity.ok(cartService.getCart(getCurrentUserEmail()));
    }

    //Add products to Cart
    @PostMapping("/add")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> addToCart(
            @RequestParam Long productId,@RequestParam Integer quantity){
        return ResponseEntity.ok(cartService.addToCart(getCurrentUserEmail(),productId,quantity));
    }

    //Remove specific entity from cart
    @DeleteMapping("/remove/{cartItemId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> removeCart(@PathVariable Long cartItemId){
        return ResponseEntity.ok(cartService.removeCart(getCurrentUserEmail(),cartItemId));
    }

    // Update quantity of a specific cart item
    @PutMapping("/update/{cartItemId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(getCurrentUserEmail(), cartItemId, quantity));
    }

    //Clear entire cart
    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<?> clearCart(){
        cartService.clearCart(getCurrentUserEmail());
        return ResponseEntity.ok("Cart Cleared Successfully");
    }
}
