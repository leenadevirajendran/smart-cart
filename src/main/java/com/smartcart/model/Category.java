package com.smartcart.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "categories")
@Data
public class Category {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
@NotBlank
@Column(unique = true)
    private String name;
    private String description;
    @JsonIgnore
    @OneToMany(mappedBy = "category",cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<Product> products ;
}
 