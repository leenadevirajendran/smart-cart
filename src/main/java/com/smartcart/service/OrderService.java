    package com.smartcart.service;

    import com.smartcart.model.*;
    import com.smartcart.repository.OrderRepository;
    import com.smartcart.repository.ProductRepository;
    import com.smartcart.repository.UserRepository;
    import jakarta.transaction.Transactional;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;

    import java.math.BigDecimal;
    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class OrderService {
        private final OrderRepository orderRepository;
        private final CartService cartService;
        private final UserRepository userRepository;
        private final ProductRepository productRepository;

        // Place an order from cart contents
        // @Transactional means if anything fails, everything rolls back
        // No partial orders — either everything succeeds or nothing does
        @Transactional
        public Order placeOrder(String  buyerEmail, String shippingAddress){
            //GET THE BUYER'S CART
            Cart cart = cartService.getCart(buyerEmail);
            //CART MUST NOT BE EMPTY
            if(cart.getItems().isEmpty()){
                throw new RuntimeException("Cart is Empty");
            }
            //GET THE BUYER
            User buyer = userRepository.findByEmail(buyerEmail)
                    .orElseThrow(()-> new RuntimeException("user not Found"));
            //Create the Order
            Order order = new Order();
            order.setBuyer(buyer);
            order.setShippingAddress(shippingAddress);
            order.setStatus(Order.OrderStatus.PLACED);

            //CONVERT EACH CART ITEM INTO ORDER ITEM
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (CartItem cartItem : cart.getItems()){
                Product product = cartItem.getProduct();

                //Check Stock is still available
                if(product.getStockQuantity()<cartItem.getQuantity()){
                    throw new RuntimeException("Insufficient stock for:"+ product.getName());
                }
                // Create order item — snapshot of product at purchase time
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(cartItem.getUnitPrice());
                orderItem.setTotalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

                order.getOrderItems().add(orderItem);

                //Reduce stock quantity
                product.setStockQuantity(product.getStockQuantity()- cartItem.getQuantity());
                productRepository.save(product);

                //Add to Total
                totalAmount = totalAmount.add(orderItem.getTotalPrice());
            }
            order.setTotalAmount(totalAmount);

            //Save the Order
            Order savedOrder = orderRepository.save(order);

            //Clear the cart after Successful Order
            cartService.clearCart(buyerEmail);
            return savedOrder;
        }
        // Place an order directly from a flash sale purchase
        // No cart involved — this is a direct "Buy Now" flow
        @Transactional
        public Order placeFlashSaleOrder(String buyerEmail, Product product,
                                         BigDecimal unitPrice,
                                         String shippingAddress) {

            User buyer = userRepository.findByEmail(buyerEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Double-check actual stock in DB before committing
            // (Redis already gated the flash-sale-specific count,
            // but this protects the real inventory number too)
            if (product.getStockQuantity() < 1) {
                throw new RuntimeException("Product is out of stock");
            }

            Order order = new Order();
            order.setBuyer(buyer);
            order.setShippingAddress(shippingAddress);
            order.setStatus(Order.OrderStatus.PLACED);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(1);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(unitPrice);

            order.getOrderItems().add(orderItem);
            order.setTotalAmount(unitPrice);

            // Reduce real product stock
            product.setStockQuantity(product.getStockQuantity() - 1);
            productRepository.save(product);

            return orderRepository.save(order);
        }

        //Get All orders for a buyer
        public List<Order> getBuyerOrders(String buyerEmail){
            return orderRepository.findByBuyerEmailOrderByCreatedAtDesc(buyerEmail);
        }

        //Get Single Order by ID
        public Order getOrderById(Long orderId, String buyerEmail){
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(()-> new RuntimeException("Order not Found"));

            //Buyer can Only see their Own Orders
            if (!order.getBuyer().getEmail().equals(buyerEmail)){
                throw new RuntimeException("Access Denied");
            }
            return order;
        }

        //Seller updates order status
        public Order updateOrderStatus(Long orderId,
                                       Order.OrderStatus newStatus,
                                       String sellerEmail){
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(()-> new RuntimeException("Order Not Found"));

            //verify this Seller has products in this order
            boolean sellerHasProducts = order.getOrderItems().stream()
                    .anyMatch(item->item.getProduct()
                            .getSeller().getEmail().equals(sellerEmail));

            if(!sellerHasProducts){
                throw new RuntimeException("You can only update orders containing your products");
            }
            order.setStatus(newStatus);
            return orderRepository.save(order);
        }
        //Get Orders for Seller
        public List<Order> getSellerOrders(String sellerEmail){
            return orderRepository.findByOrderItems_Product_SellerEmail(sellerEmail);
        }

    }

