package com.smartcart.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryWebSocketService {
    // Spring's built-in helper for sending STOMP messages
    private final SimpMessagingTemplate messagingTemplate;

    // Broadcasts the new stock count for a product to everyone
    // currently watching it in their browser
    public void broadcastStockUpdate(Long productId , Long remainingStock){
        // Anyone subscribed to /topic/stock/{productId} gets this instantly

        messagingTemplate.convertAndSend("/topic/stock/" + productId,
                Map.of( "productId",productId,
                        "remainingStock",remainingStock)

        );
    }


}
