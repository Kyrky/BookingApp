import { describe, it, expect } from 'vitest';
import type {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyResponseDto,
  PropertyListResponseDto,
} from '../property.dto';

describe('property.dto', () => {
  describe('CreatePropertyDto', () => {
    it('should accept valid property data with all required fields', () => {
      const dto: CreatePropertyDto = {
        title: 'Beautiful Apartment',
        description: 'A lovely place to stay',
        pricePerNight: 150,
        address: '123 Main St',
        ownerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(dto.title).toBe('Beautiful Apartment');
      expect(dto.description).toBe('A lovely place to stay');
      expect(dto.pricePerNight).toBe(150);
      expect(dto.address).toBe('123 Main St');
      expect(dto.ownerId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept property data with imageUrl', () => {
      const dto: CreatePropertyDto = {
        title: 'Beautiful Apartment',
        description: 'A lovely place to stay',
        pricePerNight: 150,
        address: '123 Main St',
        imageUrl: 'https://example.com/image.jpg',
        ownerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(dto.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should accept property data with null imageUrl', () => {
      const dto: CreatePropertyDto = {
        title: 'Beautiful Apartment',
        description: 'A lovely place to stay',
        pricePerNight: 150,
        address: '123 Main St',
        imageUrl: null,
        ownerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(dto.imageUrl).toBeNull();
    });

    it('should have correct types for all fields', () => {
      const dto: CreatePropertyDto = {
        title: 'string',
        description: 'string',
        pricePerNight: 100,
        address: 'string',
        ownerId: 'string',
      };
      expect(typeof dto.title).toBe('string');
      expect(typeof dto.description).toBe('string');
      expect(typeof dto.pricePerNight).toBe('number');
      expect(typeof dto.address).toBe('string');
      expect(typeof dto.ownerId).toBe('string');
    });
  });

  describe('UpdatePropertyDto', () => {
    it('should accept empty update object', () => {
      const dto: UpdatePropertyDto = {};
      expect(Object.keys(dto)).toHaveLength(0);
    });

    it('should accept partial update with title only', () => {
      const dto: UpdatePropertyDto = { title: 'Updated Title' };
      expect(dto.title).toBe('Updated Title');
    });

    it('should accept partial update with description only', () => {
      const dto: UpdatePropertyDto = { description: 'Updated description' };
      expect(dto.description).toBe('Updated description');
    });

    it('should accept partial update with pricePerNight only', () => {
      const dto: UpdatePropertyDto = { pricePerNight: 200 };
      expect(dto.pricePerNight).toBe(200);
    });

    it('should accept partial update with address only', () => {
      const dto: UpdatePropertyDto = { address: '456 New Address' };
      expect(dto.address).toBe('456 New Address');
    });

    it('should accept partial update with imageUrl as string', () => {
      const dto: UpdatePropertyDto = { imageUrl: 'https://example.com/image.jpg' };
      expect(dto.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should accept partial update with imageUrl as null', () => {
      const dto: UpdatePropertyDto = { imageUrl: null };
      expect(dto.imageUrl).toBeNull();
    });

    it('should accept update with multiple fields', () => {
      const dto: UpdatePropertyDto = {
        title: 'Updated Title',
        pricePerNight: 250,
        address: '456 New Address',
      };
      expect(dto.title).toBe('Updated Title');
      expect(dto.pricePerNight).toBe(250);
      expect(dto.address).toBe('456 New Address');
    });

    it('should accept update with all fields', () => {
      const dto: UpdatePropertyDto = {
        title: 'Updated Title',
        description: 'Updated description',
        pricePerNight: 250,
        address: '456 New Address',
        imageUrl: 'https://example.com/new-image.jpg',
      };
      expect(dto.title).toBe('Updated Title');
      expect(dto.description).toBe('Updated description');
      expect(dto.pricePerNight).toBe(250);
      expect(dto.address).toBe('456 New Address');
      expect(dto.imageUrl).toBe('https://example.com/new-image.jpg');
    });
  });

  describe('PropertyResponseDto', () => {
    const validResponse: PropertyResponseDto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Beautiful Apartment',
      description: 'A lovely place to stay',
      pricePerNight: 150,
      address: '123 Main St',
      imageUrl: 'https://example.com/image.jpg',
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-01'),
    };

    it('should accept valid property response with all fields', () => {
      expect(validResponse.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(validResponse.title).toBe('Beautiful Apartment');
      expect(validResponse.status).toBe('ACTIVE');
      expect(validResponse.createdAt).toBeInstanceOf(Date);
    });

    it('should accept property response with null imageUrl', () => {
      const response: PropertyResponseDto = {
        ...validResponse,
        imageUrl: null,
      };
      expect(response.imageUrl).toBeNull();
    });

    it('should have id field', () => {
      expect(validResponse.id).toBeDefined();
      expect(typeof validResponse.id).toBe('string');
    });

    it('should have status field', () => {
      expect(validResponse.status).toBeDefined();
      expect(typeof validResponse.status).toBe('string');
    });

    it('should have createdAt field as Date', () => {
      expect(validResponse.createdAt).toBeDefined();
      expect(validResponse.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('PropertyListResponseDto', () => {
    it('should accept empty property list', () => {
      const dto: PropertyListResponseDto = {
        properties: [],
        total: 0,
      };
      expect(dto.properties).toHaveLength(0);
      expect(dto.total).toBe(0);
    });

    it('should accept list with multiple properties', () => {
      const dto: PropertyListResponseDto = {
        properties: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Property 1',
            description: 'Description 1',
            pricePerNight: 100,
            address: 'Address 1',
            imageUrl: null,
            ownerId: 'owner-1',
            status: 'ACTIVE',
            createdAt: new Date(),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Property 2',
            description: 'Description 2',
            pricePerNight: 200,
            address: 'Address 2',
            imageUrl: 'https://example.com/image.jpg',
            ownerId: 'owner-2',
            status: 'ACTIVE',
            createdAt: new Date(),
          },
        ],
        total: 2,
      };
      expect(dto.properties).toHaveLength(2);
      expect(dto.total).toBe(2);
    });

    it('should have properties array', () => {
      const dto: PropertyListResponseDto = {
        properties: [],
        total: 0,
      };
      expect(Array.isArray(dto.properties)).toBe(true);
    });

    it('should have total count', () => {
      const dto: PropertyListResponseDto = {
        properties: [],
        total: 5,
      };
      expect(dto.total).toBe(5);
      expect(typeof dto.total).toBe('number');
    });
  });
});
