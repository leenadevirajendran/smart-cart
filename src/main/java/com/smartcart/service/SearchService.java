package com.smartcart.service;

import com.smartcart.model.Product;
import com.smartcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

private final ProductRepository productRepository;

    //smart search - keyword + optional filters
    public List<Product>  search(String keyword, Long categoryId, BigDecimal minPrice,
                                 BigDecimal maxPrice){

        // Start with keyword search on active products
        List<Product> results = keyword != null && !keyword.isBlank() ?
                productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword) :
                productRepository.findByActiveTrue();

        // Filter by category if provided
        if (categoryId != null){
            results = results.stream()
                    .filter(p->p.getCategory()!= null &&
                            p.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }
        // Filter by minimum price if provided
        if (minPrice != null){
            results = results.stream()
                    .filter(p -> p.getPrice()
                            .compareTo(maxPrice) <=0)
                    .collect(Collectors.toList());
        }
        return results;

    }



}
