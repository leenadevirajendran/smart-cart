package com.smartcart.controller;

import com.smartcart.model.Wishlist;
import com.smartcart.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    private String getCurrentUserEmail(){

        Authentication auth = SecurityContextHolder
                .getContext().getAuthentication();
        return auth.getName();
    }

    // Add product to wishlist
    @PostMapping("/add/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable Long productId){
        return ResponseEntity.ok(wishlistService.addToWishlist(getCurrentUserEmail(),productId));
    }

    // View my wishlist
    @GetMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Wishlist>> getWishlist(){
        return ResponseEntity.ok(wishlistService.getWishlist(
                getCurrentUserEmail()
        ));

    }

    // Remove from wishlist
    @DeleteMapping("remove/{productId}")
    @PreAuthorize("hasRole('BUYER')")

    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId){
        wishlistService.removeFromWishlist(getCurrentUserEmail(),productId);
        return ResponseEntity.ok("Product Removed from Wishlist Sucessfully");
    }

    // Check if product is in wishlist
    @GetMapping("/check/{productId}")
    @PreAuthorize("hasRole('BUYER')")

    public ResponseEntity<?> checkWishlist(@PathVariable Long productId){
        boolean inWishlist= wishlistService.isInWishList(getCurrentUserEmail(),productId);
        return ResponseEntity.ok(Map.of("inWishlist",inWishlist));
    }

}
