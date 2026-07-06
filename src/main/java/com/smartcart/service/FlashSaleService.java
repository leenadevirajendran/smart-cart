package com.smartcart.service;

import com.smartcart.model.FlashSale;
import com.smartcart.model.Product;
import com.smartcart.repository.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlashSaleService {
    private final FlashSaleRepository flashSaleRepository;
    private final ProductService productService;
    private final RedisTemplate<String,Object> redisTemplate;
    private final InventoryWebSocketService webSocketService;

    // Redis key pattern: "flashsale:stock:{flashSaleId}"
    // Keeping a consistent naming pattern makes debugging easy
    // e.g. redis-cli GET flashsale:stock:1

    private String stockKey(Long flashSaleId){
        return "flashsale:stock:" +flashSaleId;
    }

    // Admin/Seller creates a flash sale
    public FlashSale createFlashSale(Long productId, BigDecimal flashPrice,
                                     Integer totalStock, LocalDateTime startTime,
                                     LocalDateTime endTime) {
        Product product = productService.getProductById(productId);

        FlashSale flashSale = new FlashSale();
        flashSale.setProduct(product);
        flashSale.setFlashPrice(flashPrice);
        flashSale.setTotalStock(totalStock);
        flashSale.setStartTime(startTime);
        flashSale.setEndTime(endTime);
        flashSale.setActive(true);

        FlashSale saved = flashSaleRepository.save(flashSale);

        // Load the stock count into Redis — this is the live counter
        // buyers will actually hit when clicking "Buy Now"
        redisTemplate.opsForValue().set(stockKey(saved.getId()),String.valueOf(totalStock)
        );

        return saved;
    }

    // Get all currently live flash sales
    public List<FlashSale> getActiveFlashSales(){
        return flashSaleRepository
                .findByActiveTrueAndEndTimeAfter(LocalDateTime.now());
    }

    // Get remaining stock for a flash sale — reads straight from Redis
    public int getRemainingStock(Long flashSaleId){
        Object stock = redisTemplate.opsForValue().get(stockKey(flashSaleId));
        return stock != null ? Integer.parseInt(stock.toString()):0;
    }

    // THE CORE LOGIC — atomic stock decrement
    // Returns true if the buyer successfully grabbed a unit,
    // false if sold out
    public boolean attemptPurchase(Long flashSaleId){
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
                .orElseThrow(()->new RuntimeException("Flash Sale  not Found"));

        // Check sale is currently active and within time window
        LocalDateTime now = LocalDateTime.now();
        if (!flashSale.isActive()||
        now.isBefore(flashSale.getStartTime())||
        now.isAfter(flashSale.getEndTime())){
            throw new RuntimeException("Flash Sale is not Active Right now");
        }
        // decrement() is Redis's atomic DECR command
        // Even if 1000 requests call this at once, Redis processes
        // them one at a time internally — no race condition possible

        Long remaining = redisTemplate.opsForValue()
                .decrement(stockKey(flashSaleId));

        if (remaining == null || remaining <0){
            // Stock already at 0 or below — sold out
            // We put it back since this request didn't actually get a unit
            redisTemplate.opsForValue().increment(stockKey(flashSaleId));
            return false;
        }

        // Successfully grabbed a unit — broadcast the new count
        // to every connected browser via WebSocket
        webSocketService.broadcastStockUpdate(
                flashSale.getProduct().getId(),remaining
        );

        return true;
    }



}
