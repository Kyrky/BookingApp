import { faker } from '@faker-js/faker';

/**
 * Factory for generating test user data
 */
export class UserFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      role: 'USER',
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides: Partial<any> = {}) {
    return this.create({ ...overrides, role: 'ADMIN' });
  }
}
