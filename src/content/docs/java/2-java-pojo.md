---
title: "Java POJO"
---

# ✅ Java POJO (Plain Old Java Object)

## 1. What is a POJO and why do we use it in layered architecture?
A **POJO** is a simple Java object with:
- Private fields
- Public getters/setters
- No heavy framework dependencies
- No business logic

**Purpose in layered architecture:**
POJOs keep data representation **independent** from business, persistence, and UI frameworks. When request data enters (REST API, UI form, message queue), it is converted to a POJO so all layers use a **common, stable data structure**. If the UI or DB changes, only mapping logic updates, not the whole system.

---

## 2. How is a POJO different from a JavaBean?
| Feature         | POJO                | JavaBean                        |
|-----------------|---------------------|---------------------------------|
| Basic Definition| Any simple class    | POJO with strict conventions    |
| Requirements    | No rules            | Must have public no-arg constructor |
| Getters/Setters | Optional            | Mandatory getter & setter methods |
| Serializable    | Not required        | Should implement Serializable   |
| Used in Frameworks | Yes              | Preferred (Spring, JSP, JSF, Hibernate) |

**Summary:** All JavaBeans are POJOs, but **not all POJOs are JavaBeans**.

---

## 3. Why do we map incoming request objects to POJOs in enterprise applications?
Request objects (DTOs) are **volatile** and change with API contracts, while POJOs are **stable internal models**.

**Benefits:**
- Loose coupling: UI/REST can change without impacting business code
- Validation & transformation: Data is sanitized before business logic
- Security: Prevents exposing sensitive entity fields
- Maintainability: Only mapping logic updates when API changes

---

## 4. What happens if we expose entities (like JPA Entities) directly to the UI instead of using POJOs?
Exposing entities directly causes **serious architectural problems**:
| Risk                  | Description                                      |
|-----------------------|--------------------------------------------------|
| Security risk         | Sensitive fields leak in API                     |
| Inconsistent state    | UI can update fields that should not be modified |
| Tight coupling        | UI changes force DB-level model changes          |
| LazyInitializationException | Serialization triggers unwanted DB queries  |
| Performance issues    | Bidirectional relationships cause recursive JSON |

**Best practice:** Always use **DTO → POJO → Entity** mapping.

---

## 5. Why do we keep POJOs mutable most of the time? Can POJOs be immutable?
Most POJOs are **mutable** because:
- They represent business state that changes across layers
- Frameworks (Spring, Hibernate, Jackson) use reflection and setters

**POJOs can be immutable** when:
- Data must not change after creation (e.g., config metadata, cache keys)
- Thread-safety is required without synchronization

For enterprise request/response flows, mutability is practical, but immutability is possible and sometimes preferred.

---

## 6. Can a POJO contain business logic or should it be only data?
A POJO should **primarily hold data**, not business logic.

**Separation of Concerns:**
- POJO/DTO: represents data
- Service Layer: contains business logic
- Repository Layer: contains database access logic

If POJOs contain business logic:
- Code is hard to maintain
- State & behavior are mixed
- Unit testing is difficult
- Clean architecture principles are violated

**Exception:** Small utility or validation methods _related to the object itself_ (e.g., `calculateAge()`, `validateEmailFormat()`) are acceptable. **Core business orchestration logic should always remain in the Service layer.**

---
