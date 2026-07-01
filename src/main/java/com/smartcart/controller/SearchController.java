package com.smartcart.controller;

import com.smartcart.model.Product;
import com.smartcart.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;
    // Smart search with optional filters
    // Example: /api/search?keyword=phone&categoryId=1&minPrice=100&maxPrice=999

    @GetMapping
    public ResponseEntity<List<Product>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice){
        return ResponseEntity.ok(searchService.search(keyword,categoryId,minPrice,maxPrice));
    }
}
