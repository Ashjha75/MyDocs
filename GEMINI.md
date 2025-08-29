# Gemini Customization

This file is used to customize how Gemini interacts with your project.

## 🚀 Frontend Stack

- **Framework**: [Angular 16](https://angular.dev/)  
- **UI Libraries**:
  - [Bootstrap 5](https://getbootstrap.com/) for responsive grid and utility classes
  - [Angular Material](https://material.angular.io/) for Material Design components
- **Styling**:
  - CSS for modular and maintainable styles
  - Theme customization on top of Material’s theming system
- **Icons**: Material Icons + Bootstrap Icons (when needed)

---

## 🏗️ Angular Project Structure

- **Type**: **Module-based** architecture (❌ not standalone components)  
- **Key Modules**:
  - `AppModule` – Root module
  - `CoreModule` – Singleton services, interceptors
  - `SharedModule` – Shared components, directives, pipes
  - `FeatureModules` – Organized per feature/domain
- **Best Practices**:
  - Keep components **dumb** (presentation only) where possible
  - Use **services** for business logic and state handling
  - Apply **lazy loading** for feature modules
  - Use **barrel files (`index.ts`)** for cleaner imports
  - Follow Angular **Style Guide** conventions

---

## ⚙️ Angular Technical Details

- **Change Detection**: Default (OnPush used for performance-critical components)
- **Routing**:
  - Angular Router with lazy-loaded modules
  - Route Guards for authentication/authorization
- **State Management**:
  - Services with RxJS `BehaviorSubject`/`Observable`
  - NgRx (when global state is required, e.g., auth/user/session)
  - **State Management Boundaries**:
    - **Local State**: State that is only used by a single component or a small, well-defined part of the application.
    - **Global State**: State that is shared across multiple, unrelated parts of the application, such as user authentication status or application-wide settings.
- **Forms**:
  - Reactive Forms preferred over Template-driven
  - Custom validators for complex business logic
- **HTTP**:
  - `HttpClientModule` for API calls
  - Interceptors for auth tokens, error handling, and logging

---

## 🛠️ Tooling & Build Setup

- **Package Manager**: npm  
- **Build Tool**: Angular CLI (`ng build`, `ng serve`)  
- **Linting**: ESLint with Angular-specific rules  
- **Formatting**: Prettier for consistent style  
- **Testing**:
  - Unit Tests: Jasmine + Karma
  - E2E Tests: Cypress (preferred) or Protractor (legacy)  
- **TypeScript**:
  - Strict mode enabled (`"strict": true` in `tsconfig.json`)
  - Path aliases configured for cleaner imports

---

## ✅ Dos and Don'ts

- **Do**: Use the `async` pipe in templates to subscribe to observables.
- **Don't**: Manually subscribe to observables in components without unsubscribing in `ngOnDestroy`.
- **Do**: Use `OnPush` change detection for presentational components.
- **Don't**: Mutate data directly. Always return new instances.
- **Do**: Use barrel files (`index.ts`) for cleaner imports.
- **Don't**: Put services in the `providers` array of a `@Component` unless the service needs to be scoped to that component.

---

## ✍️ Code Examples and Snippets

### Component Boilerplate

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feature-name',
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.css']
})
export class FeatureNameComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
```

### Service with State

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeatureNameService {

  private readonly _data$ = new BehaviorSubject<string[]>([]);
  public readonly data$: Observable<string[]> = this._data$.asObservable();

  constructor() { }

  public addData(item: string): void {
    const currentData = this._data$.getValue();
    this._data$.next([...currentData, item]);
  }
}
```

### API Call

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface FeatureData {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureDataService {

  private apiUrl = 'https://api.example.com/features';

  constructor(private http: HttpClient) { }

  public getFeatures(): Observable<FeatureData[]> {
    return this.http.get<FeatureData[]>(this.apiUrl);
  }
}
```

---

## 🏷️ Specific Naming Conventions

- **File Names**: `feature-name.component.ts`, `feature-name.service.ts`, `feature-name.module.ts`
- **Class Names**: `FeatureNameComponent`, `FeatureNameService`, `FeatureNameModule`
- **Variable Names**: `camelCase` for variables and functions.
- **Constants**: `UPPER_CASE` for constants.
- **RxJS Observables**: Use a `$` suffix for observable variable names (e.g., `users$`).

---

## 📡 API Interaction Contract

- **Base URL**: `https://api.example.com/`
- **Response Format**: Assume API responses are wrapped in a `data` property (e.g., `{ "data": [...] }`).
- **Authentication**: Authentication tokens are sent in the `Authorization` header as a Bearer token.

---

## 🚨 Error Handling Philosophy

- **UI Feedback**: Display errors using Material's `MatSnackBar` component.
- **Logging**: Log detailed errors to the console during development. In production, errors should be sent to a logging service.

---

## 📐 UI/UX Practices

- Use Material Design as the baseline theme
- Apply Bootstrap utilities for layout and spacing
- Follow **mobile-first responsive design**
- Accessibility (ARIA attributes, semantic HTML)
- Consistent typography and spacing via SCSS variables
- **Visual and Branding Guidelines**:
    - **Color Palette**:
        - **Primary**: `#673AB7`
        - **Accent**: `#FFC107`
    - **Typography**:
        - **Font**: Roboto
        - **Headings**: `32px`, `24px`, `20px`
        - **Body**: `16px`

---

## 🌍 Internationalization (i18n)

- Angular i18n tooling for translations
- JSON translation files per locale
- Runtime locale switching when required

---

## 🔒 Security Considerations

- Use Angular’s built-in **sanitization** for HTML/URLs
- Apply **route guards** for authentication
- Validate all inputs in Reactive Forms
- Secure HTTP calls with JWT/Auth tokens via interceptors
- Avoid directly using `innerHTML` unless sanitized

---

## 📦 Commonly Used Angular Features

- **Directives**: Structural (`*ngIf`, `*ngFor`), Attribute (custom directives)  
- **Pipes**: Built-in (`async`, `date`, `currency`) + Custom Pipes  
- **Lifecycle Hooks**: `ngOnInit`, `ngOnDestroy` for subscriptions  
- **Dependency Injection**: Singleton services in `CoreModule`  
- **Animations**: Angular Animations API (when required)

---

## ✅ Development Principles

- Clean, maintainable, and modular code
- Reusable UI components
- Strong typing with TypeScript
- DRY (Don’t Repeat Yourself)
- Consistent naming conventions
- Unit and integration tests before deployment