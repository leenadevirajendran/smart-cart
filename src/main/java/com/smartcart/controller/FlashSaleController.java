package com.smartcart.controller;

import com.smartcart.dto.FlashSaleRequest;
import com.smartcart.model.FlashSale;
import com.smartcart.model.Order;
import com.smartcart.service.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();
        return authentication.getName();
    }


    // Only ADMIN can create flash sales
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlashSale> createFlashSale(@Valid @RequestBody FlashSaleRequest request) {
        FlashSale flashSale = flashSaleService.createFlashSale(
                request.getProductId(),
                request.getFlashPrice(),
                request.getTotalStock(),
                request.getStartTime(),
                request.getEndTime()

        );
        return ResponseEntity.ok(flashSale);
    }

    // Anyone can view currently active flash sales
    @GetMapping("/active")
    public ResponseEntity<List<FlashSale>> getActiveFlashSales() {
        return ResponseEntity.ok(flashSaleService.getActiveFlashSales());
    }

    // Anyone can check live remaining stock for a flash sale
    @GetMapping("/{id}/stock")
    public ResponseEntity<?> getRemainingStock(@PathVariable Long id) {
        int remaining = flashSaleService.getRemainingStock(id);
        return ResponseEntity.ok(Map.of("remainingStock", remaining));
    }

    // BUYER attempts to purchase during the flash sale
    // This is the endpoint that triggers the atomic Redis decrement + real order creation
    @PostMapping("/{id}/buy")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<?> buyFlashSaleItem(@PathVariable Long id,
                                              @RequestParam String shippingAddress) {
        Order order = flashSaleService.attemptPurchase(
                id,
                getCurrentUserEmail(),
                shippingAddress
        );
        return ResponseEntity.ok(order);
    }
}


