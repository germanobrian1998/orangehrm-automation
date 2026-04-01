# Page Object Model Guide

This guide explains the Page Object Model (POM) pattern as implemented in the OrangeHRM automation framework and provides step-by-step instructions for creating and using page objects.

## Table of Contents

- [POM Principles and Benefits](#pom-principles-and-benefits)
- [Creating Page Objects](#creating-page-objects)
- [Locator Strategies](#locator-strategies)
- [Method Naming Conventions](#method-naming-conventions)
- [Element Interaction Patterns](#element-interaction-patterns)
- [Reusable Component Objects](#reusable-component-objects)
- [Examples and Code Samples](#examples-and-code-samples)

---

## POM Principles and Benefits

### What is the Page Object Model?

The Page Object Model is a design pattern where each page (or significant page component) of the application is represented by a dedicated TypeScript class. The class encapsulates:

- **Selectors** – how to locate elements on that page.
- **Actions** – how to interact with those elements (click, fill, etc.).
- **Queries** – how to read information from the page (getText, isVisible, etc.).

Tests **use** page objects but do not contain selector strings or raw Playwright calls.

### Benefits

| Benefit | Description |
|---|---|
| **Separation of concerns** | Tests express *what* to verify; page objects express *how* to interact. |
| **Maintainability** | When the UI changes, only the page object (and selectors file) needs updating. |
| **Reusability** | `LoginPage.login()` is written once and used by every test that needs authentication. |
| **Readability** | Test code reads like a business specification. |
| **Debuggability** | Errors surface in one place with structured logging and automatic screenshots. |

### What belongs in a page object?

✅ **Include:**
- Navigation methods (`goToLoginPage()`)
- Form interactions (`fillUsername()`, `submitForm()`)
- State queries (`isLoggedIn()`, `getWelcomeMessage()`)
- Composite flows (`login(credentials)`)

❌ **Exclude:**
- `expect()` / assertions – these belong in tests
- Test data generation – use `@faker-js/faker` in tests
- Business logic unrelated to UI interaction

---

## Creating Page Objects

### Step 1 – Create the file

Create a new file in `packages/orangehrm-suite/src/pages/`:

```
src/pages/my-feature.page.ts
```

### Step 2 – Extend `BasePage`

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '@qa-framework/core';
import { selectors } from '../selectors';

export class MyFeaturePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
```

### Step 3 – Add selectors to `selectors.ts`

All selectors are centralised in `src/selectors.ts`. Add a new namespace for your feature:

```typescript
export const selectors = {
  // ... existing selectors ...

  myFeature: {
    container:    '.my-feature-container',
    createButton: '.orangehrm-button-margin .oxd-button--secondary',
    titleInput:   'input[name="title"]',
    saveButton:   'button[type="submit"]',
    successAlert: '.oxd-toast--success',
    itemRow:      '.oxd-table-row',
  },
};
```

### Step 4 – Implement methods

```typescript
export class MyFeaturePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    this.logger.step(1, 'Navigating to My Feature page');
    await this.goto('/my-feature');
  }

  async createItem(title: string): Promise<void> {
    try {
      this.logger.step(1, `Creating item: ${title}`);
      await this.click(selectors.myFeature.createButton);
      await this.fill(selectors.myFeature.titleInput, title);
      await this.click(selectors.myFeature.saveButton);
      await this.waitFor.elementVisible(selectors.myFeature.successAlert);
      this.logger.info(`✓ Item created: ${title}`);
    } catch (error) {
      this.logger.error('Failed to create item', error);
      await this.screenshot('create_item_failure');
      throw error;
    }
  }

  async getItemCount(): Promise<number> {
    const rows = await this.page.locator(selectors.myFeature.itemRow).count();
    return rows;
  }
}
```

### Step 5 – Export from `src/index.ts`

```typescript
export { MyFeaturePage } from './pages/my-feature.page';
```

---

## Locator Strategies

The framework uses CSS selectors stored centrally in `src/selectors.ts`. Choose selectors in this priority order:

### 1. `data-testid` / `data-cy` attributes (most stable)

```typescript
'[data-testid="submit-button"]'
'[data-cy="employee-id"]'
```

### 2. ARIA roles and accessible names

```typescript
'role=button[name="Save"]'
'role=textbox[name="Username"]'
```

### 3. Application-specific CSS classes

OrangeHRM uses `oxd-*` prefixed classes that are stable across minor UI updates:

```typescript
'.oxd-button--secondary'          // secondary action buttons
'.oxd-input'                      // text inputs
'.oxd-table-row'                  // table rows
'.oxd-toast--success'             // success toast notifications
'.orangehrm-login-button'         // login submit button
```

### 4. Text content

```typescript
'text=Login'
'button:has-text("Save")'
```

### 5. Structural selectors (least preferred)

```typescript
// ⚠️ Avoid unless no alternative exists
'.parent-class > div:nth-child(2)'
```

### Using `Locator` vs CSS strings

`BasePage` methods accept CSS selector strings. For advanced locators not covered by the base class, access `this.page` directly:

```typescript
// Using base class method (string selector)
await this.click(selectors.myFeature.createButton);

// Using Playwright Locator API directly
const rows = this.page.locator(selectors.myFeature.itemRow);
await rows.first().click();
```

---

## Method Naming Conventions

### Navigation methods

Prefix with `navigate` or `goto`:

```typescript
async navigate(): Promise<void>
async navigateToEmployeeList(): Promise<void>
```

### Action methods

Use an active verb:

```typescript
async login(credentials: LoginCredentials): Promise<void>
async createEmployee(data: CreateEmployeeDTO): Promise<void>
async deleteEmployee(employeeId: string): Promise<void>
async filterByDepartment(department: string): Promise<void>
```

### Query methods

Use `get`, `is`, `has`, `find`:

```typescript
async getText(selector: string): Promise<string>
async isLoggedIn(): Promise<boolean>
async hasSuccessAlert(): Promise<boolean>
async getEmployeeCount(): Promise<number>
async findEmployeeById(id: string): Promise<Employee | null>
```

### Verification methods

Prefix with `verify` or `assert` for methods that throw on failure:

```typescript
async verifyEmployeeInList(employeeId: string): Promise<boolean>
async verifyPageTitle(title: string): Promise<void>
```

---

## Element Interaction Patterns

### Standard form fill

```typescript
async fillEmployeeForm(data: EmployeeFormData): Promise<void> {
  await this.fill(selectors.pim.firstNameInput, data.firstName);
  await this.fill(selectors.pim.lastNameInput, data.lastName);
  await this.fill(selectors.pim.employeeIdInput, data.employeeId);
}
```

### Dropdown selection

```typescript
async selectLeaveType(leaveType: string): Promise<void> {
  await this.click(selectors.leave.leaveTypeDropdown);
  await this.page.locator(`.oxd-select-option:has-text("${leaveType}")`).click();
}
```

### Table row interaction

```typescript
async clickEditForEmployee(employeeId: string): Promise<void> {
  const row = this.page.locator(selectors.pim.employeeRow)
    .filter({ hasText: employeeId });
  await row.locator(selectors.pim.editButton).click();
}
```

### Waiting for async state changes

```typescript
async saveAndWaitForSuccess(): Promise<void> {
  await this.click(selectors.form.saveButton);
  await this.waitFor.elementVisible(selectors.shared.successToast);
  await this.waitFor.elementHidden(selectors.shared.successToast);
}
```

### Taking screenshots on failure

```typescript
async riskyAction(): Promise<void> {
  try {
    await this.click(selectors.feature.riskyButton);
    await this.waitForUrl(/expected-path/);
  } catch (error) {
    await this.screenshot('risky_action_failure');
    throw error;
  }
}
```

---

## Reusable Component Objects

For UI components that appear across multiple pages (e.g., modals, date pickers, search bars), create a dedicated component class:

```typescript
// src/pages/components/date-picker.component.ts
import { Page } from '@playwright/test';
import { BasePage } from '@qa-framework/core';

export class DatePickerComponent extends BasePage {
  private readonly triggerSelector: string;

  constructor(page: Page, triggerSelector: string) {
    super(page);
    this.triggerSelector = triggerSelector;
  }

  async selectDate(date: string): Promise<void> {
    this.logger.step(1, `Selecting date: ${date}`);
    await this.click(this.triggerSelector);
    await this.fill('.oxd-date-input input', date);
    await this.page.keyboard.press('Tab'); // dismiss the picker
    this.logger.info(`✓ Date selected: ${date}`);
  }
}
```

Use the component inside a page object:

```typescript
import { DatePickerComponent } from './components/date-picker.component';

export class LeavePage extends BasePage {
  private readonly startDatePicker: DatePickerComponent;

  constructor(page: Page) {
    super(page);
    this.startDatePicker = new DatePickerComponent(page, selectors.leave.startDateInput);
  }

  async applyLeave(fromDate: string, toDate: string): Promise<void> {
    await this.startDatePicker.selectDate(fromDate);
    // ...
  }
}
```

---

## Examples and Code Samples

### Complete page object: `LoginPage`

```typescript
import { Page } from '@playwright/test';
import { BasePage, constants } from '@qa-framework/core';
import { selectors } from '../selectors';

export interface LoginCredentials {
  username: string;
  password: string;
}

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.logger.step(1, `Logging in as ${credentials.username}`);
      await this.goto('/auth/login');
      await this.fill(selectors.login.usernameInput, credentials.username);
      await this.fill(selectors.login.passwordInput, credentials.password);
      await this.click(selectors.login.submitButton);
      await this.waitForUrl(/.*\/dashboard/);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Login successful for ${credentials.username}`);
    } catch (error) {
      this.logger.error('Login failed', error);
      await this.screenshot('login_failure');
      throw error;
    }
  }

  async loginAndExpectError(credentials: LoginCredentials): Promise<string> {
    await this.goto('/auth/login');
    await this.fill(selectors.login.usernameInput, credentials.username);
    await this.fill(selectors.login.passwordInput, credentials.password);
    await this.click(selectors.login.submitButton);
    await this.waitFor.elementVisible(selectors.login.errorMessage, constants.TIMEOUTS.MEDIUM);
    return this.getText(selectors.login.errorMessage);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.dashboard.userDropdown);
    } catch {
      return false;
    }
  }
}
```

### Using the page object in a test

```typescript
import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';

test.describe('@auth Login', () => {
  test('admin can log in successfully', async ({ page, logger }) => {
    // Arrange
    logger.step(1, 'Set up login page');
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.login({ username: 'Admin', password: 'admin123' });

    // Assert
    expect(await loginPage.isLoggedIn()).toBe(true);
    logger.assertion(true, 'Admin is logged in');
  });

  test('invalid credentials show an error message', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    const errorMessage = await loginPage.loginAndExpectError({
      username: 'wrong',
      password: 'wrong',
    });

    // Assert
    expect(errorMessage).toContain('Invalid credentials');
  });
});
```

For more examples, see the [`examples/`](./examples/) directory.
