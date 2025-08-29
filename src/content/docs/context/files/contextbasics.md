---
title : Context Flow
---


#  AI-Powered Angular Development Workflow

---

## 1. Business Logic & Docs

- Use **Google AI Studio** (2.5 Pro, 1M context)  
- Generate:
  - Business logic (English)
  - Screen elements & structure
  - CSS wireframes
  - JS/TS considerations
  - High-level docs

```mermaid
flowchart TD
    A["Idea / Feature Request"] --> B["Google AI Studio"]
    B --> C["Business Logic Doc"]
    B --> D["Screen Structure"]
    B --> E["CSS & JS Notes"]

```

----------

## 2. Template Generation

-   Generate **first screen template** from docs
    
-   Contains layout, colors, components
    

```mermaid
flowchart TD
    C["Business Logic Doc"] --> T["Initial Template (Screens)"]

```

----------

## 3. AI Refinement

-   Use **GitHub Copilot** → inline improvements
    
-   Use **Gemini CLI** → logic refinements
    

```mermaid
flowchart TD
    T["Initial Template"] --> CP["Copilot"]
    T --> GM["Gemini CLI"]
    CP --> F["Refined Code"]
    GM --> F

```

----------

## 4. Testing Layer

-   **Manual review**
    
-   **Cypress E2E testing**
    
-   Security checks (route guards, auth)
    

```mermaid
flowchart TD
    F["Refined Code"] --> R["Manual Review"]
    F --> Cyp["Cypress Tests"]
    F --> Sec["Security Layer"]

```

----------

## 5. Documentation & Deployment

-   Use **Astro Starlight** to generate docs
    
-   Deploy docs to **GitHub Pages** for reference
    

```mermaid
flowchart TD
    F["Final Code"] --> Doc["Astro Starlight Docs"]
    Doc --> GH["GitHub Pages Deployment"]

```

----------

# 🌟 Summary

1.  **AI Studio** → Business logic + docs
    
2.  **Templates** → First screen draft
    
3.  **Copilot & Gemini** → Refine
    
4.  **Testing** → Manual + Cypress
    
5.  **Docs & Deploy** → Starlight + GitHub Pages
    


