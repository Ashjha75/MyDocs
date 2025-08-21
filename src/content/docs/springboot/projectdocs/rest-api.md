---
title: Building Transactional REST Endpoints with Spring Boot
description: The Ultimate Guide to Production-Ready REST APIs with Spring Boot
---
---

### **The Scenario: E-Commerce Order Placement**

The business requirement is to create an API endpoint that allows a client to submit a new order. An order consists of a customer ID and a list of products with their quantities. This operation is **atomic**: either the entire order and all its line items are saved successfully, or nothing is. A partial order is a critical data corruption bug.

---



#### **1. The Entity Layer (`Order.java`, `OrderItem.java`)**
This defines our database structure. Note the relationship and the use of `CascadeType` for automatic management of child entities.

```java
// --- Order.java ---
package com.example.prod.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders") // Use plural for table names
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    // One Order has Many OrderItems.
    // cascade = CascadeType.ALL: If we save/delete an Order, the associated OrderItems are also saved/deleted.
    // orphanRemoval = true: If an OrderItem is removed from this list, it should be deleted from the database.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
    
    // Helper method to ensure bidirectional relationship is maintained
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}

// Enum for order status
package com.example.prod.model;
public enum OrderStatus {
    PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

```java
// --- OrderItem.java ---
package com.example.prod.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many OrderItems belong to One Order.
    // This is the owning side of the relationship.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal pricePerUnit;
}
```

#### **2. The Repository Layer (`OrderRepository.java`)**
This layer is intentionally thin. Its only job is to talk to the database.

```java
// --- OrderRepository.java ---
package com.example.prod.repository;

import com.example.prod.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Spring Data JPA provides all necessary CRUD methods.
    // Custom queries can be added here if needed, e.g., Page<Order> findByCustomerId(Long customerId, Pageable pageable);
}
```

#### **3. The DTO Layer (`CreateOrderRequest.java`, etc.)**
This is our API's public contract. Note the nested structure and detailed validation annotations.

```java
// --- CreateOrderRequest.java ---
package com.example.prod.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    @NotNull(message = "Customer ID cannot be null")
    private Long customerId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid // This is CRITICAL for triggering validation on nested objects
    private List<OrderItemRequest> items;
}
```

```java
// --- OrderItemRequest.java ---
package com.example.prod.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderItemRequest {
    @NotNull(message = "Product ID cannot be null")
    private Long productId;
    
    @NotNull(message = "Quantity cannot be null")
    @Positive(message = "Quantity must be a positive number")
    private Integer quantity;
}
```

```java
// --- OrderResponse.java ---
package com.example.prod.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private Long customerId;
    private LocalDateTime orderDate;
    private BigDecimal totalPrice;
    private String status;
    private List<OrderItemResponse> items;
}
```

```java
// --- OrderItemResponse.java ---
package com.example.prod.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Long productId;
    private Integer quantity;
    private BigDecimal pricePerUnit;
}
```

#### **4. The Global Exception Handler**
A single, centralized place to manage all errors and return clean, consistent JSON responses.

```java
// --- GlobalExceptionHandler.java ---
package com.example.prod.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@ControllerAdvice // This annotation makes it a global exception handler
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Resource Not Found", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ErrorResponse errorResponse = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Validation Failed", errorMessage);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // A catch-all for any other unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex, WebRequest request) {
        // Log the full stack trace for unexpected errors
        log.error("An unexpected error occurred: {}", request.getDescription(false), ex);
        ErrorResponse errorResponse = new ErrorResponse(LocalDateTime.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", "An unexpected error occurred. Please contact support.");
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

// --- ResourceNotFoundException.java (custom exception) ---
package com.example.prod.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// --- ErrorResponse.java (standard error DTO) ---
package com.example.prod.exception;
import java.time.LocalDateTime;
public record ErrorResponse(LocalDateTime timestamp, int status, String error, String message) {}
```

#### **5. The Service Layer (`OrderService.java`)**
This is the core. It contains business logic, transactional control, and structured logging.

```java
// --- OrderService.java ---
package com.example.prod.service;

import com.example.prod.dto.CreateOrderRequest;
import com.example.prod.exception.ResourceNotFoundException;
import com.example.prod.model.*;
import com.example.prod.repository.OrderRepository;
import com.example.prod.repository.ProductRepository; // Assuming this exists to fetch product details
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository; // For fetching product data

    // Constructor Injection: The professional standard
    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional // This is the magic. All or nothing.
    public Order createOrder(CreateOrderRequest request) {
        log.info("Attempting to create order for customer ID: {}", request.getCustomerId());
        
        // In a real app, you would validate the customer exists.
        // Customer customer = customerRepository.findById(request.getCustomerId()).orElseThrow(...);
        
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalOrderPrice = BigDecimal.ZERO;

        for (var itemRequest : request.getItems()) {
            // Fetch product from DB to get its real price and ensure it exists.
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> {
                    log.error("Create order failed: Product not found with ID {}", itemRequest.getProductId());
                    return new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId());
                });

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPricePerUnit(product.getPrice()); // Use price from DB, not from client
            
            order.addItem(orderItem); // Add item to order using our helper method

            totalOrderPrice = totalOrderPrice.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }
        
        order.setTotalPrice(totalOrderPrice);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Successfully created order with ID: {}", savedOrder.getId());
        return savedOrder;
    }

    public Order getOrderById(Long id) {
        log.info("Fetching order with ID: {}", id);
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
}
```

#### **6. The Controller Layer (`OrderController.java`)**
The public-facing entry point. Clean, documented, and concerned only with HTTP.

```java
// --- OrderController.java ---
package com.example.prod.controller;

import com.example.prod.dto.CreateOrderRequest;
import com.example.prod.dto.OrderResponse;
import com.example.prod.mapper.OrderMapper; // Assume you have a mapper
import com.example.prod.model.Order;
import com.example.prod.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Order Management", description = "APIs for creating and retrieving orders") // For Swagger
public class OrderController {
    
    private final OrderService orderService;
    private final OrderMapper orderMapper; // Using a mapper is a best practice

    public OrderController(OrderService orderService, OrderMapper orderMapper) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }

    @Operation(summary = "Create a new order", description = "Creates a new order from a customer and a list of products.")
    @ApiResponse(responseCode = "201", description = "Order created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data provided")
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Order newOrder = orderService.createOrder(request);
        
        // Best practice: return a Location header with the URI of the new resource
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(newOrder.getId())
            .toUri();
        
        OrderResponse response = orderMapper.toResponse(newOrder);
        return ResponseEntity.created(location).body(response);
    }
    
    @Operation(summary = "Get an order by ID")
    @ApiResponse(responseCode = "200", description = "Order found")
    @ApiResponse(responseCode = "404", description = "Order not found")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        OrderResponse response = orderMapper.toResponse(order);
        return ResponseEntity.ok(response);
    }
}
```

---

### **The Explanation: A Sensi's Breakdown**

Now, I will explain the "why" behind every decision.

#### **1. `@Transactional`: The Atomicity Guarantee**
Look at the `createOrder` method in `OrderService`. It's annotated with `@Transactional`. This is **the most critical annotation** for this feature.
*   **What it does:** It tells Spring to wrap this entire method in a single database transaction. When the method is called, Spring starts a transaction. It then executes your code. If the method completes successfully, Spring commits the transaction, and all database changes (the new `Order` and all new `OrderItem`s) are saved permanently.
*   **Why it's Production-Ready:** If *anything* goes wrong—for example, the `productRepository.findById()` throws our `ResourceNotFoundException` for the third item in a five-item order—Spring catches the exception, **rolls back the entire transaction**, and aborts. The database is left in the exact state it was in before the method was called. No partial data. No corruption. This ensures data integrity, which is non-negotiable.

#### **2. Structured Logging with SLF4J: Your Production Debugging Lifeline**
Notice the `private static final Logger log = LoggerFactory.getLogger(...)` and the `log.info(...)`, `log.error(...)` calls.
*   **What it is:** Using a standard logging framework (SLF4J is the Java standard) to write structured log messages.
*   **Why it's Production-Ready:** `System.out.println()` is for amateurs. In production, your application logs are aggregated into tools like Splunk, Datadog, or an ELK stack. Structured logs are essential for:
    *   **Traceability:** We log the customer and order IDs, so if a customer reports a problem, we can search the logs for that exact ID to trace the entire request flow.
    *   **Alerting:** You can set up alerts based on log patterns, like a high frequency of `log.error` messages.
    *   **Performance Analysis:** By logging entry and exit times, you can analyze how long specific operations are taking.
    *   **Security:** Never log sensitive information like passwords or full credit card numbers.

#### **3. The DTO Pattern & `@Valid`: A Bulletproof API Contract**
We never let our JPA entities touch the controller.
*   **What it is:** We define explicit `Request` and `Response` DTOs. The `CreateOrderRequest` contains `@NotNull` and `@NotEmpty`. Crucially, the list of items is annotated with `@Valid`.
*   **Why it's Production-Ready:**
    *   **Decoupling:** Your database model can change without breaking your public API. You can add an internal `lastModifiedBy` field to your `Order` entity, and your clients will never know or care.
    *   **Security:** You control exactly what data goes in and what data goes out. A client cannot try to set the `orderDate` or `totalPrice`—that is calculated on the server, a core business rule.
    *   **Nested Validation:** The `@Valid` annotation tells Spring to also validate the objects *inside* the list (`OrderItemRequest`). Without it, a client could submit an order with `null` product IDs, and the validation would pass at the top level, causing a `NullPointerException` deep in your service layer. We catch errors at the gate.

#### **4. Global Exception Handling: Predictability and Professionalism**
Our `@ControllerAdvice` class is the application's bouncer.
*   **What it is:** A centralized place to handle all exceptions. It catches our custom `ResourceNotFoundException`, validation failures (`MethodArgumentNotValidException`), and has a final `catch-all` for anything unexpected.
*   **Why it's Production-Ready:**
    *   **Consistent Error Format:** The client always receives the same JSON error structure (`ErrorResponse`), regardless of what went wrong. This makes client-side error handling trivial.
    *   **No Stack Traces:** Leaking a Java stack trace to the client is a security risk and looks unprofessional. Our `catch-all` logs the full stack trace for our developers but returns a generic, safe message to the user.

#### **5. API Documentation with OpenAPI (`@Tag`, `@Operation`)**
Annotations from `io.swagger.v3.oas.annotations` are used in the controller.
*   **What it is:** Providing metadata about your API directly in the code. Tools like `springdoc-openapi` read these annotations to generate a beautiful, interactive documentation page (the Swagger UI).
*   **Why it's Production-Ready:** Your API is a product. Products need documentation. This allows frontend developers, mobile developers, and other backend teams to understand and test your API without needing to ask you questions. It's a cornerstone of team efficiency.

#### **6. `ResponseEntity` and RESTful Principles**
We don't just return the DTO from our `createOrder` method. We wrap it in a `ResponseEntity`.
*   **What it is:** A Spring object that gives you full control over the HTTP response.
*   **Why it's Production-Ready:** Being RESTful means respecting HTTP semantics. For a `POST` that creates a resource, the correct HTTP status code is **`201 Created`**, not `200 OK`. Furthermore, the standard dictates you should return a `Location` header pointing to the URI of the newly created resource. Our code does exactly that, which is the mark of a mature API designer.
