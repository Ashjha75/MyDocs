---
title : Common Attacks
---

### **Part 1: The Threat Landscape - Common Web Application Attacks**

An advanced developer doesn't just apply security; they understand the specific threats they are defending against.

#### **1. SQL Injection (SQLi)**
*   **What it is:** An attack where a malicious actor inserts (or "injects") their own SQL code into a data input field. The application then unknowingly executes this malicious SQL against its own database.
*   **Analogy:** A website has a login form. The server's code naively concatenates the input: `String query = "SELECT * FROM users WHERE username = '" + userInput + "'";`. An attacker enters `' OR '1'='1' --` as their username. The final query becomes `SELECT * FROM users WHERE username = '' OR '1'='1' --'`, which logs them in as the first user in the database.
*   **Why it's Dangerous:** It can lead to complete database compromise: data theft, data modification, data deletion, and in some cases, full remote code execution on the server.
*   **Your Primary Defense:** **Using Parameterized Queries (Prepared Statements).**
    *   **Your Knowledge Context:** You have already mastered this! Spring Data JPA and Hibernate use parameterized queries by default for all repository methods. This is one of the primary reasons we use an ORM—it provides a powerful, built-in defense against SQLi.

#### **2. Cross-Site Scripting (XSS)**
*   **What it is:** An attack where a malicious script is injected into a trusted website. When an unsuspecting user visits the page, the malicious script executes within their browser.
*   **Analogy:** A blog allows comments with HTML. An attacker posts a comment containing `<script>... steal cookie logic ...</script>`. When another user views that blog post, the script runs in *their* browser, with the full trust of the blog's domain.
*   **Why it's Dangerous:** It can be used to steal user session cookies/tokens, perform actions on behalf of the user, redirect them to malicious sites, or rewrite the page content.
*   **Your Primary Defense:** **Output Encoding and Content Security Policy (CSP).** All user-supplied data that is rendered on a page must be sanitized or encoded (e.g., `<` becomes `&lt;`). Template engines like Thymeleaf and modern frontend frameworks like React do this automatically. CSP is an HTTP header that tells the browser which sources of scripts are trusted.

#### **3. Cross-Site Request Forgery (CSRF)**
*   **What it is:** An attack that tricks a logged-in user's browser into making an unwanted, malicious request to a web application with which they are currently authenticated.
*   **Analogy:** You are logged into your bank's website (`mybank.com`). You then visit a malicious website (`evil.com`). This site has an invisible image: `<img src="http://mybank.com/transfer?to=attacker&amount=1000">`. Your browser, wanting to be helpful, automatically includes your authentication cookie for `mybank.com` with the request, and the transfer happens without your knowledge.
*   **Why it's Dangerous:** It allows attackers to perform unauthorized actions on behalf of a user, like changing their password, making purchases, or deleting data.
*   **Your Primary Defense:** **CSRF Tokens.** Spring Security provides robust, built-in CSRF protection for stateful (session-based) applications.
    *   **Your Knowledge Context:** For the stateless JWT-based REST APIs we will focus on, CSRF is less of a concern because the token is not sent automatically by the browser like a cookie.

#### **4. Denial-of-Service (DoS / DDoS) Attack**
*   **What it is:** An attempt to make an online service unavailable to its intended users by overwhelming it with a flood of illegitimate traffic. DDoS (Distributed Denial-of-Service) uses thousands of compromised computers to launch the attack.
*   **Analogy:** A hundred thousand people call a pizza shop's single phone line at the same time, preventing any real customers from getting through.
*   **Why it's Dangerous:** It directly impacts business by making your application unavailable to legitimate users.
*   **Your Primary Defense:** This is primarily an **infrastructure-level** defense (Cloudflare, AWS Shield, firewalls, load balancers). Application-level defenses include **rate limiting** to prevent a single user from making too many requests.

#### **5. CORS (Cross-Origin Resource Sharing) Issues**
*   **What it is:** This is **not an attack**, but a **browser security feature** that developers often misunderstand. By default, a browser will block a script on `website-a.com` from making an AJAX request to an API on `api.my-app.com`. This is called the Same-Origin Policy. CORS is the mechanism for the server to tell the browser, "It's okay, I trust `website-a.com`. You can allow that request."
*   **Why it's Dangerous (if misconfigured):** If you configure your API's CORS policy to allow all origins (`*`), you could allow a malicious website to make requests to your API from their users' browsers.
*   **Your Primary Defense:** A correctly configured CORS policy on your Spring Boot server that **whitelists** only the specific frontend domains that are allowed to access it. Spring Security provides excellent, fine-grained control over this.

---
