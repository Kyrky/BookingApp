import { faker } from '@faker-js/faker';

/**
 * Factory for generating test property data
 */
export class PropertyFactory {
  static create(overrides: Partial<any> = {}) {
    const pricePerNight = faker.number.int({ min: 50, max: 500 });
    const maxGuests = faker.number.int({ min: 1, max: 10 });

    return {
      id: faker.string.uuid(),
      title: faker.lorem.words({ min: 3, max: 6 }).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: faker.lorem.paragraphs(2),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.countryCode('alpha-2'),
      pricePerNight,
      maxGuests,
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      beds: faker.number.int({ min: 1, max: maxGuests }),
      bathrooms: faker.number.int({ min: 1, max: 3 }),
      imageUrl: faker.image.url({
        width: 800,
        height: 600,
        category: 'architecture',
      }),
      ownerId: faker.string.uuid(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, (_, i) =>
      this.create({ ...overrides, title: `Property ${i + 1}` })
    );
  }
}
