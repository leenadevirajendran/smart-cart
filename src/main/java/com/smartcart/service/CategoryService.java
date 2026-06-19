package com.smartcart.service;

import com.smartcart.model.Category;
import com.smartcart.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    //Create a new category(Admin Only)
    public Category createCategory(String name, String description){
        if (categoryRepository.existsByName(name)){
            throw new RuntimeException("Category already Exists");
        }
        Category category =new Category();
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);

    }

    //Get all categories
     public List<Category> getAllCategories() {
         return categoryRepository.findAll();
     }

     //Get Single Category by Id
    public Category getCategoryById(Long id){
        return categoryRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Category not found with ID"+id));
    }

    //Update Category(Admin Only)
    public Category updateCategory(Long id, String name, String description){
        Category category = getCategoryById(id);
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    //Delete category(Admin Only)
    public void deleteCategory(Long id){
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
