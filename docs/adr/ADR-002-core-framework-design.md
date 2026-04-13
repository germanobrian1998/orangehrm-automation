# ADR-002 Core Framework Design

## Context

In software development, especially when dealing with automation frameworks, it is crucial to design the architecture in a way that promotes reusability, simplicity, and maintainability. One effective way to achieve this is by using base classes.

## Decision

We have decided to implement base classes such as `BasePage` and `BaseApiClient`. These base classes serve as foundational elements for our page objects and API clients, providing common functionalities that can be inherited by specific implementations.

### Benefits of Using Base Classes

1. **Code Reusability**: By defining generic methods and properties in base classes, we can reuse this code across multiple classes without rewriting it.
   - For example, methods for handling standard actions like navigating to a page or making API calls can be centralized in `BasePage` or `BaseApiClient`.

2. **Inheritance Advantages**: Inheriting from base classes allows specific classes to extend the functionality of these foundational elements.
   - Subclasses can add or override functionalities that are specific to their use cases, while still leveraging the shared code in the base class.

3. **Abstraction**: Base classes provide an abstraction layer that hides complexity from the user. The specific implementation details can be managed within the base class, offering a clean interface to the users of the derived classes.
   - For instance, a user of a derived page class does not need to understand how the underlying page navigation works, as this is abstracted away in `BasePage`.

4. **Reducing Duplication**: With base classes, we can significantly reduce code duplication. Common code lived in one place helps avoid inconsistencies and bugs that may arise from duplicated logic.
   - This consolidation strengthens the maintainability of the codebase, as changes need to be made in only one location.

## Conclusion

Implementing a core framework design using base classes like `BasePage` and `BaseApiClient` will enable us to build a more robust, maintainable, and scalable automation testing framework.
