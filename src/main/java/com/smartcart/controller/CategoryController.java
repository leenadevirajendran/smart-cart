package com.smartcart.controller;

import com.smartcart.dto.CategoryRequest;
import com.smartcart.model.Category;
import com.smartcart.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    //Only ADMIN can create categories
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request){
        Category category = categoryService.createCategory
                (request.getName(),
                request.getDescription()
        );
        return ResponseEntity.ok(category);
    }
    //Anyone can view categories(even without login)
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(){
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    //Anyone can view a single category
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryBuId(@PathVariable Long id){
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    //Only Admin can update categories
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category>updateCategory(@PathVariable Long id ,@Valid @RequestBody CategoryRequest request){
        Category category = categoryService.updateCategory(
                id,
                request.getName(),
                request.getDescription());
        return ResponseEntity.ok(category);
    }

    //Only Admin can delete Categories
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?>deleteCategory(@PathVariable Long id){
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");

    }

}
