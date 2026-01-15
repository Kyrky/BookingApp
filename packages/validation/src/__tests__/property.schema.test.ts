import { describe, it, expect } from 'vitest';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdSchema,
  type CreatePropertyInput,
  type UpdatePropertyInput,
} from '../property.schema';

describe('property.schema', () => {
  describe('createPropertySchema', () => {
    const validInput: CreatePropertyInput = {
      title: 'Beautiful Apartment',
      description: 'A lovely place to stay with all amenities',
      pricePerNight: 150,
      address: '123 Main St, City',
      imageUrl: 'https://example.com/image.jpg',
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
    };

    describe('valid inputs', () => {
      it('should accept valid property data with all fields', () => {
        const result = createPropertySchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept valid property data without imageUrl', () => {
        const input = { ...validInput, imageUrl: null };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept valid property data with undefined imageUrl', () => {
        const { imageUrl, ...rest } = validInput;
        const result = createPropertySchema.safeParse(rest);
        expect(result.success).toBe(true);
      });

      it('should accept minimum valid values', () => {
        const minInput: CreatePropertyInput = {
          title: 'ABC', // min 3
          description: '0123456789', // min 10
          pricePerNight: 0, // min 0
          address: '12345', // min 5
          imageUrl: null,
          ownerId: '550e8400-e29b-41d4-a716-446655440000',
        };
        const result = createPropertySchema.safeParse(minInput);
        expect(result.success).toBe(true);
      });

      it('should accept maximum valid values', () => {
        const maxInput: CreatePropertyInput = {
          title: 'A'.repeat(200), // max 200
          description: 'A'.repeat(5000), // max 5000
          pricePerNight: 1000000, // max 1000000
          address: 'A'.repeat(500), // max 500
          imageUrl: 'https://example.com/image.jpg',
          ownerId: '550e8400-e29b-41d4-a716-446655440000',
        };
        const result = createPropertySchema.safeParse(maxInput);
        expect(result.success).toBe(true);
      });
    });

    describe('title validation', () => {
      it('should reject title shorter than 3 characters', () => {
        const input = { ...validInput, title: 'AB' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toMatch(/>=3/);
        }
      });

      it('should reject title longer than 200 characters', () => {
        const input = { ...validInput, title: 'A'.repeat(201) };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toMatch(/<=200/);
        }
      });

      it('should reject empty title', () => {
        const input = { ...validInput, title: '' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject non-string title', () => {
        const input = { ...validInput, title: 123 as unknown as string };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('description validation', () => {
      it('should reject description shorter than 10 characters', () => {
        const input = { ...validInput, description: 'Short' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toMatch(/>=10/);
        }
      });

      it('should reject description longer than 5000 characters', () => {
        const input = { ...validInput, description: 'A'.repeat(5001) };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toMatch(/<=5000/);
        }
      });

      it('should reject empty description', () => {
        const input = { ...validInput, description: '' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('pricePerNight validation', () => {
      it('should reject negative price', () => {
        const input = { ...validInput, pricePerNight: -1 };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject price greater than 1000000', () => {
        const input = { ...validInput, pricePerNight: 1000001 };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject non-number price', () => {
        const input = { ...validInput, pricePerNight: 'free' as unknown as number };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should accept zero price', () => {
        const input = { ...validInput, pricePerNight: 0 };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('address validation', () => {
      it('should reject address shorter than 5 characters', () => {
        const input = { ...validInput, address: '1234' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject address longer than 500 characters', () => {
        const input = { ...validInput, address: 'A'.repeat(501) };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject empty address', () => {
        const input = { ...validInput, address: '' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('imageUrl validation', () => {
      it('should reject invalid URL format', () => {
        const input = { ...validInput, imageUrl: 'not-a-url' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject URL without protocol', () => {
        const input = { ...validInput, imageUrl: 'example.com/image.jpg' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should accept valid HTTP URL', () => {
        const input = { ...validInput, imageUrl: 'http://example.com/image.jpg' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept valid HTTPS URL', () => {
        const input = { ...validInput, imageUrl: 'https://example.com/image.jpg' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('ownerId validation', () => {
      it('should reject non-UUID format', () => {
        const input = { ...validInput, ownerId: 'not-a-uuid' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject empty string as ownerId', () => {
        const input = { ...validInput, ownerId: '' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should accept valid UUID v4', () => {
        const input = { ...validInput, ownerId: '550e8400-e29b-41d4-a716-446655440000' };
        const result = createPropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updatePropertySchema', () => {
    describe('valid partial updates', () => {
      it('should accept updating only title', () => {
        const input: UpdatePropertyInput = { title: 'Updated Title' };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept updating only description', () => {
        const input: UpdatePropertyInput = { description: 'Updated description' };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept updating only pricePerNight', () => {
        const input: UpdatePropertyInput = { pricePerNight: 200 };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept updating only address', () => {
        const input: UpdatePropertyInput = { address: '456 New Address' };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept updating multiple fields', () => {
        const input: UpdatePropertyInput = {
          title: 'Updated Title',
          pricePerNight: 250,
        };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept updating all fields', () => {
        const input: UpdatePropertyInput = {
          title: 'Updated Title',
          description: 'Updated description',
          pricePerNight: 250,
          address: '456 New Address',
          imageUrl: 'https://example.com/new-image.jpg',
        };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept null imageUrl', () => {
        const input: UpdatePropertyInput = { imageUrl: null };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid updates', () => {
      it('should reject empty object', () => {
        const input: UpdatePropertyInput = {};
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain('At least one field');
        }
      });

      it('should reject invalid title in partial update', () => {
        const input: UpdatePropertyInput = { title: 'AB' };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject invalid price in partial update', () => {
        const input: UpdatePropertyInput = { pricePerNight: -50 };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject invalid URL in imageUrl update', () => {
        const input: UpdatePropertyInput = { imageUrl: 'invalid-url' };
        const result = updatePropertySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('propertyIdSchema', () => {
    it('should accept valid UUID', () => {
      const result = propertyIdSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(result.success).toBe(true);
    });

    it('should reject non-UUID string', () => {
      const result = propertyIdSchema.safeParse({ id: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = propertyIdSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });

    it('should reject malformed UUID', () => {
      const result = propertyIdSchema.safeParse({ id: '550e8400-e29b-41d4-a716' });
      expect(result.success).toBe(false);
    });

    it('should reject object without id field', () => {
      const result = propertyIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
