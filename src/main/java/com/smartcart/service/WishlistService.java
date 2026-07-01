package com.smartcart.service;

import com.smartcart.model.Product;
import com.smartcart.model.User;
import com.smartcart.model.Wishlist;
import com.smartcart.repository.ProductRepository;
import com.smartcart.repository.UserRepository;
import com.smartcart.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    //Add Product to Wishlist
    public Wishlist addToWishlist(String buyerEmail, Long productId){
        if (wishlistRepository.existsByBuyerEmailAndProductId(buyerEmail, productId)){
            throw new RuntimeException("Product already in your Wishlist");
        }

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(()->new RuntimeException("User not Found"));

        Product product = productService.getProductById(productId);
        Wishlist wishlist = new Wishlist();
        wishlist.setBuyer(buyer);
        wishlist.setProduct(product);
         return wishlistRepository.save(wishlist);
    }

    //Get all wishlist items for a buyer
    public List<Wishlist> getWishlist(String buyerEmail){
        return wishlistRepository.findByBuyerEmail(buyerEmail);
    }
    //Remove from wishlist
    public void  removeFromWishlist(String buyerEmail,Long productId){
        Wishlist wishlist = wishlistRepository.findByBuyerEmailAndProductId(buyerEmail,productId)
                .orElseThrow(()->new RuntimeException("Item not found in wishlist"));
                wishlistRepository.delete(wishlist);
        }
        //Check if product is in buyer's wishlist
    public boolean isInWishList(String buyerEmail, Long productId){
        return wishlistRepository.existsByBuyerEmailAndProductId(buyerEmail,productId);

    }

}
