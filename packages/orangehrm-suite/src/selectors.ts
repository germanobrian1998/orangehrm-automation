/**
 * OrangeHRM Suite - Selectors
 * Centralized UI selectors for OrangeHRM pages
 */

export const selectors = {
  login: {
    usernameInput: '#orangehrm-username',
    passwordInput: '#orangehrm-password',
    submitButton: 'button[type="submit"]',
    errorMessage: '.oxd-alert-content',
    logoutButton: 'button:has-text("Logout")',
  },

  dashboard: {
    heading: 'h1:has-text("Dashboard")',
    userDropdown: '.oxd-userdropdown-tab',
    logoutOption: 'a:has-text("Logout")',
  },

  pim: {
    sidebarLink: 'a:has-text("PIM")',
    employeeListLink: 'a:has-text("Employee List")',
    addEmployeeButton: 'button:has-text("Add")',
    firstNameInput: 'input[placeholder="First Name"]',
    lastNameInput: 'input[placeholder="Last Name"]',
    employeeIdInput: 'input[placeholder="Employee Id"]',
    emailInput: 'input[type="email"]',
    photoInput: 'input[type="file"]',
    saveButton: 'button[type="submit"]:has-text("Save")',
    employeeTable: '.oxd-table-body',
    employeeRow: (employeeId: string) => `tr:has-text("${employeeId}")`,
    firstNameField: 'input[placeholder="First Name"]',
    searchButton: 'button:has-text("Search")',
    fieldError: (fieldName: string) => `div:has-text("${fieldName}") ~ div.oxd-form-row-error`,
    requiredError: '.oxd-input-group__error-message',
  },

  leave: {
    sidebarLink: 'a:has-text("Leave")',
    applyLeaveLink: 'a:has-text("Apply Leave")',
    leaveListLink: 'a:has-text("My Leave")',
    leaveTypeSelect: '.oxd-select-text',
    fromDateInput: 'input[placeholder="yyyy-mm-dd"]',
    toDateInput: 'input[placeholder="yyyy-mm-dd"]',
    commentTextarea: 'textarea',
    submitButton: 'button[type="submit"]:has-text("Apply")',
    leaveTable: '.oxd-table-body',
    leaveRow: (leaveId: string) => `tr:has-text("${leaveId}")`,
    approveButton: 'button:has-text("Approve")',
    rejectButton: 'button:has-text("Reject")',
  },

  admin: {
    sidebarLink: 'a:has-text("Admin")',
    usersLink: 'a:has-text("Users")',
    jobTitlesLink: 'a:has-text("Job Titles")',
    addUserButton: 'button:has-text("Add")',
    usernameInput: 'input[placeholder="Username"]',
    passwordInput: 'input[type="password"]',
    userTable: '.oxd-table-body',
    addJobTitleButton: 'button:has-text("Add")',
    jobTitleInput: 'input[placeholder="Job Title"]',
  },

  common: {
    navbar: '.oxd-topbar',
    sidebar: '.oxd-sidebar-body',
    modal: '.oxd-dialog-container',
    confirmButton: 'button:has-text("Confirm")',
    cancelButton: 'button:has-text("Cancel")',
    loadingSpinner: '.oxd-loading-spinner',
    successMessage: '.oxd-toast--success',
    errorAlert: '.oxd-alert--error',
  },
} as const;

export type Selectors = typeof selectors;
