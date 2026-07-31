package com.smartcart.controller;

import com.smartcart.dto.ProductRequest;
import com.smartcart.model.Product;
import com.smartcart.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    private String getLoggedInEmail(){
        return SecurityContextHolder.getContext()
                .getAuthentication().getName();
    }

    //Only SELLER can create products
    //@AuthenticationPrincipal extracts the logged-in user from JWT

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> createProduct(@Valid
                                                 @RequestBody ProductRequest request){
        Product product = productService.createProduct(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getCategoryId(),
                getLoggedInEmail()
        );
        return ResponseEntity.ok(product);
    }

    //Anyone can browse all active products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(){
        return ResponseEntity.ok((productService.getAllActiveProducts()));
    }

    //Anyone can view a single product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id){
        return ResponseEntity.ok((productService.getProductById(id)));
    }

    //Get products by Category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>>getProductsByCategory(@PathVariable Long categoryId){
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    //Seller views their own Products
    @GetMapping("/myproducts")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Product>> getMyProducts(){
        return ResponseEntity.ok(productService.getProductsBySeller(getLoggedInEmail()));

    }

    //Search products by Keyword
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String keyword){
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    //Only Seller can update their products
    @PutMapping("{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid
            @RequestBody ProductRequest request){
        Product product = productService.updateProduct(
                id,
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getCategoryId(),
                getLoggedInEmail()
        );
        return ResponseEntity.ok(product);
    }

    //Advanced filter: keyword + category + price range + sort
    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(productService.filterProducts(keyword, categoryId, minPrice, maxPrice, sortBy));
    }

    //Only Seller can delete their product

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id) {
        productService.deleteProduct(id,getLoggedInEmail());
        return ResponseEntity.ok("Product deleted Successfully");

    }


}
