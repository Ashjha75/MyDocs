
---
title : Docker Basics
---

***

### **The Grand Syllabus: Mastering Docker for the Spring Boot Professional**

Our journey is divided into four modules. Each module begins with a core problem, presents the solution, dives into the essential mechanics, and culminates in knowledge ready for production and interviews.

---

#### **Module 1: The Foundation — Understanding the Vessel**

*   **The Core Problem:** The chaos of "it works on my machine," inconsistent environments leading to bugs, and the heavy-handed nature of traditional Virtual Machines.
*   **The Solution: OS-Level Virtualization**
    *   **Container vs. VM (Deep Dive):** We will dissect the architectural differences. You will learn to articulate precisely how sharing the host OS kernel, enabled by **Linux Namespaces** (for isolation) and **Control Groups** (for resource limiting), makes containers faster and more lightweight than the hypervisor-based approach of VMs.
    *   **The Docker Architecture:** Understanding the flow of control is paramount. We will visualize the relationship between the `docker` **Client**, the `dockerd` **Daemon**, its **REST API**, and the role of a **Registry**.

    ```mermaid
    graph TD
        subgraph Your Machine
            A[You on CLI] -- docker build/run/pull --> B(Docker Client)
        end
        B -- REST API over socket --> C{Docker Daemon / dockerd}
        C -- Manages --> D[Images]
        C -- Creates/Runs --> E[Containers]
        C -- Pulls/Pushes --> F((Docker Hub/Registry))
    ```

*   **The Craftsman's Toolkit (Essential Commands):** These are not just commands to memorize; they are the extensions of your will. We will master the daily workflow:
    *   **Lifecycle:** `build`, `run`, `ps`, `logs`, `stop`, `rm`.
    *   **Inspection:** `exec -it <container> /bin/bash` (your window into the running container), `images`, `inspect`.
    *   **Hygiene:** `system prune` (to keep your workspace clean).

---

#### **Module 2: The Blueprint — Forging a Production-Grade Spring Boot Image**

*   **The Core Problem:** How do you define a standardized, efficient, and secure environment for your Spring Boot application that is both portable and reproducible?
*   **The Solution: The `Dockerfile`**
    *   **The Naive Approach:** We will start with a basic `Dockerfile` to understand the fundamentals: `FROM`, `COPY`, `EXPOSE`, `ENTRYPOINT`.
    *   **The Professional Standard (Deep Dive): The Multi-Stage Build.** This is non-negotiable for a compiled language. You will learn to write and, more importantly, *explain* a `Dockerfile` that:
        1.  Uses a `build` stage with a full JDK and Maven/Gradle to compile the application and run tests.
        2.  Uses a final, minimal `runtime` stage based on a JRE image.
        3.  Copies *only* the compiled `.jar` artifact from the build stage into the final stage.
        4.  **Why:** This dramatically reduces image size (from >1GB to ~200MB), minimizes the attack surface by removing the JDK and build tools, and improves security.

    *   **Dockerfile Best Practices (Interview Gold):**
        *   **Leverage Layer Caching:** Ordering your `Dockerfile` instructions from least to most frequently changing (`COPY pom.xml` and `RUN mvn dependency:go-offline` before `COPY src ...`).
        *   **Use `.dockerignore`:** To prevent secrets, build artifacts, and unnecessary files from entering the build context.
        *   **Run as Non-Root User:** We will implement the `RUN addgroup ...` & `USER ...` pattern to avoid running the application with root privileges inside the container—a critical security measure.

---

#### **Module 3: The Ecosystem — Orchestrating Your Local Stack with Compose**

*   **The Core Problem:** Your Spring Boot application is useless without its database. Managing the lifecycle and networking of both containers individually with `docker run` commands is inefficient and error-prone.
*   **The Solution: The `docker-compose.yml` File**
    *   **Declarative Stack Definition:** We will create a `docker-compose.yml` to define your application (`app`) and database (`db`) services as a single, cohesive unit.
    *   **Core Concepts (Deep Dive):**
        1.  **Service Discovery:** You will learn why the `SPRING_DATASOURCE_URL` becomes `jdbc:mysql://db:3306/myapp`. Docker Compose creates a private virtual network, allowing containers to resolve each other by their service name (`db`). This is a foundational concept for microservices.
        2.  **Persistent State with Named Volumes:** We will configure a **named volume** for your MySQL container (`db_data:/var/lib/mysql`). You will learn the critical difference between named volumes (managed by Docker, the correct choice for data) and bind mounts (mapping host directories, good for development/hot-reloading).
    *   **The Conductor's Baton (Essential Commands):** `up`, `down`, `logs`, `build`.

---

#### **Module 4: The Gauntlet — Production Readiness & Interview Mastery**

*   **The Core Problem:** You have containerized your application. How do you debug it effectively, ensure it is secure, and confidently articulate your knowledge in a high-stakes interview?
*   **The Solution: A Proactive Mindset and Deep Recall**
    *   **Debugging Workflow:**
        *   **Is it running?** `docker ps -a`
        *   **Why did it fail?** `docker logs <container>`
        *   **What's inside?** `docker exec -it <container> /bin/bash`
        *   **What's its configuration?** `docker inspect <container>`
    *   **Production & Security Concerns:**
        *   **Configuration:** Using environment variables in `docker-compose.yml` to inject configuration (like database credentials) is the standard. Never bake secrets into an image.
        *   **Health:** Connecting Spring Boot Actuator's `/health` endpoint to Docker's `HEALTHCHECK` instruction.
    *   **The Interview Gauntlet (Your Final Test):** By the end of our training, you will be able to answer these questions not just correctly, but with depth and insight, explaining the "why" behind each answer.
        1.  "Walk me through your production-grade, multi-stage `Dockerfile` for this Spring Boot application. Justify every decision."
        2.  "What are three distinct ways to reduce the size of a Docker image?"
        3.  "My Spring Boot container cannot connect to the MySQL container in Docker Compose. What are your first five debugging steps?"
        4.  "Explain the difference between a named volume and a bind mount. When would you use each for a Spring Boot project?"
        5.  "Why is it a security risk to run a container as the root user, and how do you prevent it?"

---

