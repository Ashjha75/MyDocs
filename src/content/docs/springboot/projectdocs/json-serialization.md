---
title: Springboot Json Serialization and Deserialization
---

---

# 📌 JSON Serialization & Deserialization in Spring Boot

---

## 1. **Core Concept**

* **Serialization** → Java Object ➝ JSON String (Response to Client).
* **Deserialization** → JSON String ➝ Java Object (Request from Client).
* **Spring Boot uses Jackson library by default** (via `MappingJackson2HttpMessageConverter`).

---

## 2. **How It Happens in Spring Boot**

### 🔹 Serialization (Response Flow)

1. Controller returns a **Java object**.
2. Spring MVC finds a suitable **HttpMessageConverter**.
3. For `application/json`, it uses **MappingJackson2HttpMessageConverter**.
4. This internally uses **Jackson’s ObjectMapper** to convert object ➝ JSON.
5. JSON is written to the **HTTP Response Body**.

### 🔹 Deserialization (Request Flow)

1. Client sends **JSON request body**.
2. Spring MVC detects `@RequestBody` on method parameter.
3. **MappingJackson2HttpMessageConverter** is selected for JSON.
4. Jackson **ObjectMapper** maps JSON ➝ Java object.
5. The controller method gets the populated Java object.

---

## 3. **Important Classes Involved**

* **ObjectMapper** → Core Jackson class for serialization/deserialization.
* **MappingJackson2HttpMessageConverter** → Bridge between Spring MVC and Jackson.
* **HttpMessageConverter** → Strategy interface to convert objects to/from HTTP body.

---

## 4. **Key Annotations (Jackson)**

* `@JsonProperty("fieldName")` → Rename JSON property.
* `@JsonIgnore` → Skip field from JSON.
* `@JsonInclude(Include.NON_NULL)` → Exclude null fields.
* `@JsonFormat(pattern="yyyy-MM-dd")` → Format dates.
* `@JsonCreator` / `@JsonValue` → Custom object creation.

---

## 5. **Customization Options**

1. **Configure ObjectMapper Globally**

   ```java
   @Bean
   public ObjectMapper objectMapper() {
       return new ObjectMapper()
               .setSerializationInclusion(JsonInclude.Include.NON_NULL)
               .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
   }
   ```

2. **Custom Serializer/Deserializer**

   ```java
   public class UserSerializer extends JsonSerializer<User> {
       @Override
       public void serialize(User user, JsonGenerator gen, SerializerProvider serializers) throws IOException {
           gen.writeStartObject();
           gen.writeStringField("username", user.getName());
           gen.writeEndObject();
       }
   }
   ```

   Usage:

   ```java
   @JsonSerialize(using = UserSerializer.class)
   private User user;
   ```

---

## 6. **Interview-Level Insights**

* **Default Library**: Jackson (but you can plug in Gson, JSON-B, etc.).
* **Spring Boot Auto-Configuration**: Auto-registers Jackson’s `ObjectMapper`.
* **Converter Priority**: If multiple converters exist, Spring chooses based on `Content-Type` & `Accept` headers.
* **Common Interview Qs:**

  1. *How does Spring Boot convert objects to JSON internally?*
     → Through `MappingJackson2HttpMessageConverter` using `ObjectMapper`.
  2. *How to ignore null values in JSON response?*
     → Use `@JsonInclude(Include.NON_NULL)` or configure `ObjectMapper`.
  3. *What happens if a JSON field doesn’t match Java field?*
     → By default, Jackson ignores unknown fields (`FAIL_ON_UNKNOWN_PROPERTIES = false`). Can be configured.
  4. *Can you replace Jackson?*
     → Yes, by excluding Jackson dependency & adding Gson or JSON-B.
  5. *How does Spring know which converter to use?*
     → By checking the `Content-Type` of the request & `Accept` header of the response.

---

✅ **One-Liner Summary for Interviews**:
*In Spring Boot, JSON serialization (Java ➝ JSON) and deserialization (JSON ➝ Java) are handled automatically by `MappingJackson2HttpMessageConverter`, which delegates to Jackson’s `ObjectMapper`. Behavior can be customized via Jackson annotations or by configuring the `ObjectMapper` bean.*

---
