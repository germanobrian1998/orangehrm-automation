/**
 * Shared Utils - Test Data Factory
 * Generates realistic test data using @faker-js/faker.
 */

import { faker } from '@faker-js/faker';

export interface EmployeeData {
  firstName: string;
  lastName: string;
  middleName: string;
  employeeId: string;
  email: string;
}

export interface UserData {
  username: string;
  password: string;
  email: string;
}

export class TestDataFactory {
  /** Generate a random employee record */
  static employee(): EmployeeData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      employeeId: faker.string.numeric(6),
      email: faker.internet.email(),
    };
  }

  /** Generate a random user account */
  static user(): UserData {
    return {
      username: faker.internet.userName().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
      email: faker.internet.email(),
    };
  }

  /** Generate a unique ID for test isolation */
  static uniqueId(prefix: string = 'test'): string {
    return `${prefix}-${faker.string.alphanumeric(8)}`;
  }

  /** Generate a date string in YYYY-MM-DD format */
  static dateString(daysOffset: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }
}
