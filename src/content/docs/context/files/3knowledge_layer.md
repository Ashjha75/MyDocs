---
title : 3. Knowledge Layer
---

This document is a repository of knowledge for the project. It includes links to useful resources, best practices, and solutions to common problems.

---

## 📚 Useful Resources

- **Angular**: [Official Documentation](https://angular.dev/), [Angular Style Guide](https://angular.io/guide/styleguide)
- **RxJS**: [Official Documentation](https://rxjs.dev/), [Learn RxJS](https://www.learnrxjs.io/)
- **Angular Material**: [Official Documentation](https://material.angular.io/)
- **Bootstrap 5**: [Official Documentation](https://getbootstrap.com/docs/5.0/)

---

## ✨ Best Practices and Design Patterns

- **Smart and Dumb Components**: Use a clear separation between smart components (containers) that manage state and dumb components (presentational) that just display data.
- **Reactive Forms**: Use Reactive Forms for all forms. They are more scalable and easier to test than template-driven forms.
- **State Management**: For simple cases, use RxJS `BehaviorSubject` in services to manage state. For more complex, global state, use NgRx.
- **Containerization**: All services and components should be designed to be easily containerized with Docker.

---

## 💡 Solutions to Common Problems

- **ExpressionChangedAfterItHasBeenCheckedError**: This error often occurs when a value is changed in a child component after the parent component has already been checked. To fix this, you can use `ChangeDetectorRef.detectChanges()` or refactor your code to avoid the double binding.
- **Memory Leaks**: To avoid memory leaks, always unsubscribe from observables in your components. The easiest way to do this is to use the `async` pipe in your templates. If you need to subscribe in your component's code, use a `takeUntil` operator with a subject that emits in `ngOnDestroy`.

---

## 📖 Glossary

- **Observable**: A stream of data that can be subscribed to.
- **BehaviorSubject**: A type of observable that stores the last emitted value and emits it to new subscribers.
- **Interceptor**: A service that can intercept and modify HTTP requests and responses.
- **Directive**: A class that can add new behavior to elements in the DOM.
