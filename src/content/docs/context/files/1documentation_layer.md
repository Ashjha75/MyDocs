---
title : 1. Documentation Layer
---

This document outlines the documentation standards for this project. Consistent and clear documentation is crucial for maintainability, onboarding new team members, and ensuring a shared understanding of the codebase.

---

## 📄 `GEMINI.md`

The `GEMINI.md` file is the primary source of truth for how the AI should interact with this project. It should be kept up-to-date with the latest conventions and architectural decisions.

- **Owner**: The project lead is responsible for maintaining this file.
- **Updates**: Any significant changes to the project's architecture, dependencies, or conventions should be reflected in this file.

---

##  commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This provides a clear and consistent commit history, which is easy to read and can be used to automate changelog generation.

- **Format**: `<type>(<scope>): <subject>`
- **Example**: `feat(auth): add password reset feature`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## ✍️ Code Comments

- **Clarity over Clutter**: Only add comments to explain *why* something is done, not *what* is being done. The code itself should be self-explanatory.
- **TODOs**: Use `// TODO:` for future work, and include a brief description of what needs to be done.
- **JSDoc for Services**: For public methods in services, add JSDoc comments to explain the purpose, parameters, and return values.

---

## 📖 Business Logic Documentation

- **Location**: Business logic documentation will be provided by you and should be stored in a dedicated `business_layer.md` file.
- **Content**: This file should describe the core business rules, processes, and entities of the application.
