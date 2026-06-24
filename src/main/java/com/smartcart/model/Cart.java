package com.smartcart.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //One buyer has exactly one cart
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    //One Cart had many items
    //OrphanRemoval = true means if cartitem is removed from this list,
    // its gets automatically deleted from the database
    @OneToMany(mappedBy = "cart",cascade = CascadeType.ALL,
    orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

}
