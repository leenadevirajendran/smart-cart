package com.smartcart.service;

import com.smartcart.model.Category;
import com.smartcart.model.Product;
import com.smartcart.model.User;
import com.smartcart.repository.ProductRepository;
import com.smartcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import com.smartcart.repository.ProductSpecification;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final UserRepository userRepository;

    //Create product - only sellers can do this
    public Product createProduct(String name, String description, BigDecimal price, Integer stockQuantity, Long categoryId, String sellerEmail){
        //Find seller by email from JWT token
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow(()->new RuntimeException("Seller not Found!!"));
    //Make sure seller has seller role
        if (seller.getRole()!=User.Role.SELLER){
            throw new RuntimeException("Only Sellers can create products");
        }
     //Find the Category
        Category category =categoryService.getCategoryById(categoryId);

     //Build the product
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setCategory(category);
        product.setSeller(seller);

        return productRepository.save(product);
    }
    //Get all active products(for buyers browsing)
    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }
     //Get single product by ID
        public Product getProductById(Long id){
            return productRepository.findById(id).orElseThrow(()->new RuntimeException("Product not found with id"+id));
    }

    //Get products by Category
    public List<Product> getProductsByCategory(Long id){
        return productRepository.findByCategoryId(id);
    }

    //Get Products By seller
    public List<Product> getProductsBySeller(String sellerEmail){
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(()->new RuntimeException("Seller not Found"));
        return productRepository.findBySellerId(seller.getId());
    }

   //Search products by Keyword
    public List<Product> searchProducts(String keyword) {
        return productRepository
                .findByNameContainingIgnoreCaseAndActiveTrue(keyword);
    }

    //Advanced filter: keyword + category + price range + sort, using JPA Specifications
    public List<Product> filterProducts(String keyword, Long categoryId, BigDecimal minPrice,
                                        BigDecimal maxPrice, String sortBy) {

        Specification<Product> spec = ProductSpecification.isActive()
                .and(ProductSpecification.hasKeyword(keyword))
                .and(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.minPrice(minPrice))
                .and(ProductSpecification.maxPrice(maxPrice));

        Sort sort = switch (sortBy) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending();
        };

        return productRepository.findAll(spec, sort);
    }
    //Update product - Only the Seller who owns it can update
    public Product updateProduct(Long id, String name, String description, BigDecimal price,
                                 Integer stockQuantity, Long categoryId, String sellerEmail){

    Product product = getProductById(id);

    if(!product.getSeller().getEmail().equals(sellerEmail)){
        throw new RuntimeException("You can only update your own products");

    }
    Category category = categoryService.getCategoryById(categoryId);
    product.setName(name);
    product.setDescription(description);
    product.setPrice(price);
    product.setStockQuantity(stockQuantity);
    product.setCategory(category);

    return productRepository.save(product);
    }

    //Soft delete - don't actually delete, just set active = false
    public void deleteProduct(Long id, String sellerEmail){
        Product product = getProductById(id);

       if(!product.getSeller().getEmail().equals(sellerEmail)){
           throw new RuntimeException("You can only delete your own products");
       }

       product.setActive(false);
       productRepository.save(product);
    }






}

