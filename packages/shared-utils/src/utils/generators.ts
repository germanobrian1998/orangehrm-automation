/**
 * @qa-framework/shared-utils - Data Generators
 * Functions that produce randomised, realistic test data for OrangeHRM tests.
 * Uses @faker-js/faker as the underlying engine.
 */

import { faker } from '@faker-js/faker';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GeneratedEmployee {
  firstName: string;
  lastName: string;
  middleName: string;
  employeeId: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  hireDate: string;
}

export interface GeneratedUser {
  username: string;
  password: string;
  email: string;
  role: 'Admin' | 'ESS';
}

export interface GeneratedAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ─── Scalar generators ────────────────────────────────────────────────────────

/** Generate a random first name. */
export function randomFirstName(): string {
  return faker.person.firstName();
}

/** Generate a random last name. */
export function randomLastName(): string {
  return faker.person.lastName();
}

/** Generate a random full name (first + last). */
export function randomFullName(): string {
  return `${randomFirstName()} ${randomLastName()}`;
}

/** Generate a random valid e-mail address. */
export function randomEmail(domain: string = 'example.com'): string {
  const user = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${user}@${domain}`;
}

/** Generate a random numeric ID string of the given length. */
export function randomId(length: number = 6): string {
  return faker.string.numeric(length);
}

/** Generate a unique prefixed identifier for test isolation. */
export function uniqueId(prefix: string = 'test'): string {
  return `${prefix}-${faker.string.alphanumeric(8)}`;
}

/** Generate a random password of the given length (min 8 characters). */
export function randomPassword(length: number = 12): string {
  return faker.internet.password({ length: Math.max(8, length) });
}

/** Generate a random phone number string. */
export function randomPhone(): string {
  return faker.phone.number();
}

/** Return a date string (YYYY-MM-DD) offset by the given number of days from today. */
export function randomDateString(daysOffset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// ─── Composite generators ─────────────────────────────────────────────────────

/**
 * Generate a complete employee record suitable for OrangeHRM tests.
 */
export function generateEmployee(overrides: Partial<GeneratedEmployee> = {}): GeneratedEmployee {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
    employeeId: faker.string.numeric(6),
    email: randomEmail(),
    phone: faker.phone.number(),
    jobTitle: faker.person.jobTitle(),
    department: faker.commerce.department(),
    hireDate: randomDateString(-Math.floor(Math.random() * 365 * 3)),
    ...overrides,
  };
}

/**
 * Generate a user account record.
 */
export function generateUser(overrides: Partial<GeneratedUser> = {}): GeneratedUser {
  return {
    username: faker.internet.userName().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20),
    password: randomPassword(),
    email: randomEmail(),
    role: Math.random() > 0.5 ? 'Admin' : 'ESS',
    ...overrides,
  };
}

/**
 * Generate a mailing address.
 */
export function generateAddress(overrides: Partial<GeneratedAddress> = {}): GeneratedAddress {
  return {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: faker.location.country(),
    ...overrides,
  };
}

/**
 * Create an array of N generated items using the provided factory function.
 */
export function generateMany<T>(factory: () => T, count: number): T[] {
  return Array.from({ length: count }, factory);
}

/**
 * Pick a random element from an array.
 * Throws if the array is empty.
 */
export function randomPick<T>(items: T[]): T {
  if (items.length === 0) throw new Error('Cannot pick from an empty array');
  return items[Math.floor(Math.random() * items.length)];
}
