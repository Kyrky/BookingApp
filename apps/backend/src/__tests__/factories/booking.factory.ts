import { faker } from '@faker-js/faker';

/**
 * Factory for generating test booking data
 */
export class BookingFactory {
  static create(overrides: Partial<any> = {}) {
    const startDate = faker.date.future({ years: 0.1 });
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 14 }));
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = faker.number.int({ min: 50, max: 500 });

    return {
      id: faker.string.uuid(),
      propertyId: faker.string.uuid(),
      userId: faker.string.uuid(),
      startDate,
      endDate,
      totalGuests: faker.number.int({ min: 1, max: 4 }),
      totalPrice: days * pricePerNight,
      status: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createPending(overrides: Partial<any> = {}) {
    return this.create({ ...overrides, status: 'PENDING' });
  }

  static createConfirmed(overrides: Partial<any> = {}) {
    return this.create({ ...overrides, status: 'CONFIRMED' });
  }

  static createCompleted(overrides: Partial<any> = {}) {
    return this.create({ ...overrides, status: 'COMPLETED' });
  }

  static createCancelled(overrides: Partial<any> = {}) {
    return this.create({ ...overrides, status: 'CANCELLED' });
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create booking with specific date range
   */
  static createWithDates(startDate: Date, endDate: Date, overrides: Partial<any> = {}) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = faker.number.int({ min: 50, max: 500 });

    return this.create({
      startDate,
      endDate,
      totalPrice: days * pricePerNight,
      ...overrides,
    });
  }

  /**
   * Create booking that overlaps with given dates
   */
  static createOverlapping(targetStart: Date, targetEnd: Date, overrides: Partial<any> = {}) {
    // Start 2 days before, end 2 days after
    const startDate = new Date(targetStart);
    startDate.setDate(startDate.getDate() - 2);
    const endDate = new Date(targetEnd);
    endDate.setDate(endDate.getDate() + 2);

    return this.createWithDates(startDate, endDate, overrides);
  }
}
