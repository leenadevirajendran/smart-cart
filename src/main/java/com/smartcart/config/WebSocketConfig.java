package com.smartcart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    // This is the URL the frontend connects to
    // e.g. new SockJS('http://localhost:8080/ws')
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*"); // allow all origins for dev
    }
    //Sets up the message Channels
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry){
        //message sent to the server use this prefix
        registry.setApplicationDestinationPrefixes("/app");

        //Message broadcast From the server to browsers use "/topic"
        //eg. server sends to /topic/stock/1, all subscribers receive it
        registry.enableSimpleBroker("/topic");
    }

}
