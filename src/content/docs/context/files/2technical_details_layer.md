---
title : 2. Technical Details Layer
---

This document provides a more detailed breakdown of the technical aspects of the project, expanding on the information in `GEMINI.md`.

---

## 📂 Project Structure

- **`src/app`**: Contains the core application logic.
  - **`components`**: Reusable, presentational components.
  - **`containers`**: Smart components that manage state and interact with services.
  - **`core`**: Core module with singleton services and interceptors.
  - **`features`**: Feature modules, each with its own components, services, and routes.
  - **`models`**: TypeScript interfaces and classes for data models.
  - **`services`**: Application-wide services.
  - **`shared`**: Shared module with common components, directives, and pipes.
  - **`styles`**: Global styles and theme files.

---

## 📦 Third-Party Libraries

- **State Management**: RxJS for reactive programming. NgRx should only be used for complex, global state.
- **UI**: Angular Material for components, Bootstrap 5 for grid and utilities.
- **Utility**: `lodash-es` for utility functions. Use tree-shakable imports (e.g., `import { get } from 'lodash-es';`).

---

## 🚀 Build and Deployment

- **CI/CD**: The project uses GitHub Actions for continuous integration and deployment.
- **Build Process**: The `angular.json` file is configured with separate build configurations for development, staging, and production.
- **Environments**: Environment-specific variables are stored in the `src/environments` directory.

---

## ⚡ Performance Optimization

- **Change Detection**: Use `OnPush` change detection strategy for all presentational components.
- **Lazy Loading**: All feature modules are lazy-loaded.
- **Bundle Size**: Regularly analyze the bundle size using `webpack-bundle-analyzer` to identify and remove unnecessary dependencies.
- **Caching**: Use service workers to cache static assets and API responses.
