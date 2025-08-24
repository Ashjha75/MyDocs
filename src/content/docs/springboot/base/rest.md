---
title: Rest basics
---



---

### **The Professional's Guide to RESTful API Design & Best Practices**

This document provides a deep dive into the concepts, standards, and practical considerations for designing and building production-grade REST APIs, with a specific focus on what is expected in a Spring Boot developer interview.

---

#### **Module 1: Basics of REST and HTTP**

**What is REST?**
REST stands for **RE**presentational **S**tate **T**ransfer. It is not a protocol or a standard; it is an **architectural style** for designing networked applications. It provides a set of constraints that, when followed, lead to scalable, maintainable, and loosely coupled systems that work seamlessly over the HTTP protocol.

**Key REST Principles (Interview Angle):**
An interviewer wants to know if you understand the *implications* of these principles.

1.  **Stateless:** This is the most critical principle. The server holds no client session state. Every single request from a client must contain all the information necessary for the server to understand and process it.
    *   **Why it matters:** Statelessness enables massive scalability. Any server instance can handle any request, making it easy to load balance and add/remove servers on demand.
2.  **Client-Server Separation:** The client (e.g., a frontend application) and the server (your Spring Boot API) are completely separate. They communicate only through the well-defined REST API.
    *   **Why it matters:** This allows teams to work independently. The frontend team can build a React app while the backend team builds the API. As long as they adhere to the API contract, they can evolve separately.
3.  **Uniform Interface:** This principle enforces a consistent and predictable way of interacting with resources. It's the core of what makes REST work. It has four sub-constraints: resource identification (URIs), resource manipulation through representations (JSON), self-descriptive messages, and HATEOAS.
4.  **Cacheable:** Responses from the server should declare whether they can be cached.
    *   **Why it matters:** Caching dramatically improves performance and scalability by reducing the load on the server. `GET` requests are the primary candidates for caching.
5.  **Idempotency:** A crucial concept. An operation is idempotent if making the same request multiple times produces the same result as making it once.
    *   **`GET`, `PUT`, `DELETE` MUST be idempotent.** Deleting user 123 ten times is the same as deleting it once.
    *   **`POST` is NOT idempotent.** Sending the same "create order" request twice will result in two orders.

---

#### **Module 2: HTTP Methods (Verbs)**

These are the verbs of your API. Using the correct verb for the correct action is a sign of a professional.

| Method | Action | Idempotent? | Spring Annotation |
| :--- | :--- | :--- | :--- |
| **GET** | Retrieve a representation of a resource. | Yes | `@GetMapping` |
| **POST** | Create a new subordinate resource. | No | `@PostMapping` |
| **PUT** | **Replace** an existing resource with a new representation. | Yes | `@PutMapping` |
| **PATCH**| Apply a **partial update** to a resource. | No | `@PatchMapping` |
| **DELETE**| Delete a resource. | Yes | `@DeleteMapping` |

**Interview Gold: The `PUT` vs. `PATCH` Showdown**
This is a classic question to test your depth of knowledge.

*   **`PUT` (Complete Replacement):** When you use `PUT`, the request payload should represent the *entire* resource. If a field is omitted from the `PUT` request, the server should interpret this as an instruction to set that field to `null` or its default value.
    *   *Example:* To update a user's email, a `PUT` request to `/users/123` would need to include the user's name, age, and all other fields, otherwise they would be wiped out.
*   **`PATCH` (Partial Update):** When you use `PATCH`, the request payload should contain only the fields that need to be changed. All other fields on the server should remain untouched.
    *   *Example:* To update a user's email, a `PATCH` request to `/users/123` would send a simple JSON body: `{"email": "new.email@example.com"}`.

---

#### **Module 3: HTTP Status Codes (Your API's Vocabulary)**

Status codes are not just numbers; they are a critical part of the API contract. Using them correctly is essential.

**2xx (Success):**
*   `200 OK`: The standard success response for `GET`, `PUT`, `PATCH`, or `DELETE`.
*   `201 Created`: The required response for a successful `POST`. The response should also include a `Location` header pointing to the URI of the newly created resource.
*   `204 No Content`: A successful response that has no body. The classic use case is for a `DELETE` request.

**4xx (Client Errors):** The client made a mistake.
*   `400 Bad Request`: A generic client-side error. Often used when the request payload is malformed or missing required parameters.
*   `404 Not Found`: The requested resource (e.g., `/users/999`) does not exist.
*   `409 Conflict`: The request could not be completed due to a conflict with the current state of the resource. A common example is trying to create a user with an email that already exists.

**Interview Gold: The `401` vs. `403` Dilemma**
This is the single most common status code question.

*   **`401 Unauthorized`**: **"I don't know who you are."** This means the request lacks valid authentication credentials. The client has not proven their identity (e.g., missing or invalid JWT). The correct action for the client is to authenticate (log in) and try again.
*   **`403 Forbidden`**: **"I know who you are, but you are not allowed to do this."** This means authentication was successful, but the authenticated user does not have the necessary permissions (authorization) to access the requested resource. The correct action for the client is... nothing. Trying again won't help. They need their permissions to be elevated by an administrator.

**5xx (Server Errors):** The server made a mistake.
*   `500 Internal Server Error`: A generic, unexpected error on the server side (e.g., an unhandled `NullPointerException`). The client should not see the stack trace, only a standardized error message.

---

#### **Modules 4, 5, 6, 7: A Unified View on API Design**

These modules all contribute to a clean, predictable, and professional API contract.

*   **Resource Naming:** Use **plural nouns** for collections (e.g., `/products`, `/orders`). Verbs have no place in URIs.
*   **Versioning:** URI versioning (`/api/v1/users`) is the most common and practical approach. It's explicit and easy to manage with routing rules and separate controllers in Spring Boot.
*   **Headers:**
    *   **Request:** `Content-Type: application/json` tells the server you are sending JSON. `Accept: application/json` tells the server you want JSON back. `Authorization: Bearer <token>` carries the user's identity.
    *   **Response:** `Location: /api/v1/users/124` is returned with a `201 Created` to show where the new resource lives.
*   **Error Handling:** Use a standardized error DTO and a `@ControllerAdvice` in Spring Boot to ensure that every error, regardless of where it occurs, results in a consistent JSON error response.

---

#### **Modules 8, 9, 10: Advanced & Operational Concerns**

*   **Authentication vs. Authorization:**
    *   **Authentication (AuthN):** The process of verifying a user's identity. *Who are you?* (e.g., logging in with a username/password to get a JWT).
    *   **Authorization (AuthZ):** The process of verifying what an authenticated user is allowed to do. *What can you do?* (e.g., checking if a user has the 'ADMIN' role before allowing them to delete another user).
*   **Caching & Performance:**
    *   **Pagination** is non-negotiable for any API endpoint that returns a collection. Never return all 1 million products at once. Use request parameters like `/products?page=2&size=50`.
    *   **Rate Limiting** is a server-side mechanism to prevent abuse by limiting the number of requests a client can make in a given time period.
*   **HATEOAS:**
    *   **Concept:** Hypermedia as the Engine of Application State. In simple terms, the API response tells the client what they can do next by providing links.
    *   **Why it's advanced:** It allows for a truly "discoverable" API. A client doesn't need to have all the URI patterns hardcoded; it can follow the links provided by the server. This leads to very loosely coupled systems but can add complexity to both the server and client. For most internal microservices, it is considered overkill, but for public-facing APIs, it can be very powerful.