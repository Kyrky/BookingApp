import { describe, it, expect } from 'vitest';
import {
  BookingStatus,
  PaymentStatus,
  type CreateBookingDto,
  type UpdateBookingDto,
  type BookingResponseDto,
  type BookingListResponseDto,
  type BookingCalendarDto,
  type BookingAvailabilityDto,
} from '../booking.dto';

describe('booking.dto', () => {
  describe('BookingStatus', () => {
    it('should have PENDING status', () => {
      expect(BookingStatus.PENDING).toBe('PENDING');
    });

    it('should have CONFIRMED status', () => {
      expect(BookingStatus.CONFIRMED).toBe('CONFIRMED');
    });

    it('should have COMPLETED status', () => {
      expect(BookingStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should have CANCELLED status', () => {
      expect(BookingStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should have all 4 statuses', () => {
      const statuses = Object.values(BookingStatus);
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain('PENDING');
      expect(statuses).toContain('CONFIRMED');
      expect(statuses).toContain('COMPLETED');
      expect(statuses).toContain('CANCELLED');
    });
  });

  describe('PaymentStatus', () => {
    it('should have PENDING status', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING');
    });

    it('should have COMPLETED status', () => {
      expect(PaymentStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should have FAILED status', () => {
      expect(PaymentStatus.FAILED).toBe('FAILED');
    });

    it('should have REFUNDED status', () => {
      expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
    });

    it('should have all 4 statuses', () => {
      const statuses = Object.values(PaymentStatus);
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain('PENDING');
      expect(statuses).toContain('COMPLETED');
      expect(statuses).toContain('FAILED');
      expect(statuses).toContain('REFUNDED');
    });
  });

  describe('CreateBookingDto', () => {
    it('should accept valid booking data with all required fields', () => {
      const dto: CreateBookingDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        totalGuests: 2,
        totalPrice: 400,
      };
      expect(dto.propertyId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(dto.userId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(dto.startDate).toBeInstanceOf(Date);
      expect(dto.endDate).toBeInstanceOf(Date);
      expect(dto.totalGuests).toBe(2);
      expect(dto.totalPrice).toBe(400);
    });

    it('should have correct types for all fields', () => {
      const dto: CreateBookingDto = {
        propertyId: 'string',
        userId: 'string',
        startDate: new Date(),
        endDate: new Date(),
        totalGuests: 1,
        totalPrice: 100,
      };
      expect(typeof dto.propertyId).toBe('string');
      expect(typeof dto.userId).toBe('string');
      expect(dto.startDate).toBeInstanceOf(Date);
      expect(dto.endDate).toBeInstanceOf(Date);
      expect(typeof dto.totalGuests).toBe('number');
      expect(typeof dto.totalPrice).toBe('number');
    });
  });

  describe('UpdateBookingDto', () => {
    it('should accept empty update object', () => {
      const dto: UpdateBookingDto = {};
      expect(Object.keys(dto)).toHaveLength(0);
    });

    it('should accept update with totalGuests only', () => {
      const dto: UpdateBookingDto = { totalGuests: 4 };
      expect(dto.totalGuests).toBe(4);
    });
  });

  describe('BookingResponseDto', () => {
    const validResponse: BookingResponseDto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      propertyId: '550e8400-e29b-41d4-a716-446655440001',
      userId: '550e8400-e29b-41d4-a716-446655440002',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      totalGuests: 2,
      totalPrice: 400,
      status: 'CONFIRMED',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should accept valid booking response with all required fields', () => {
      expect(validResponse.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(validResponse.propertyId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(validResponse.userId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(validResponse.status).toBe('CONFIRMED');
    });

    it('should have id field', () => {
      expect(validResponse.id).toBeDefined();
      expect(typeof validResponse.id).toBe('string');
    });

    it('should have status field', () => {
      expect(validResponse.status).toBeDefined();
      expect(typeof validResponse.status).toBe('string');
    });

    it('should have createdAt and updatedAt fields', () => {
      expect(validResponse.createdAt).toBeInstanceOf(Date);
      expect(validResponse.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept optional days field', () => {
      const response: BookingResponseDto = {
        ...validResponse,
        days: 4,
      };
      expect(response.days).toBe(4);
    });

    it('should accept optional property field', () => {
      const response: BookingResponseDto = {
        ...validResponse,
        property: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Beautiful Apartment',
          address: '123 Main St',
          imageUrl: 'https://example.com/image.jpg',
          pricePerNight: 100,
        },
      };
      expect(response.property).toBeDefined();
      expect(response.property?.title).toBe('Beautiful Apartment');
    });

    it('should accept optional user field', () => {
      const response: BookingResponseDto = {
        ...validResponse,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };
      expect(response.user).toBeDefined();
      expect(response.user?.name).toBe('John Doe');
      expect(response.user?.email).toBe('john@example.com');
    });

    it('should accept response with both property and user', () => {
      const response: BookingResponseDto = {
        ...validResponse,
        days: 4,
        property: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Beautiful Apartment',
          address: '123 Main St',
          imageUrl: null,
          pricePerNight: 100,
        },
        user: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };
      expect(response.property?.title).toBe('Beautiful Apartment');
      expect(response.user?.name).toBe('John Doe');
    });
  });

  describe('BookingListResponseDto', () => {
    it('should accept empty booking list', () => {
      const dto: BookingListResponseDto = {
        bookings: [],
        total: 0,
      };
      expect(dto.bookings).toHaveLength(0);
      expect(dto.total).toBe(0);
    });

    it('should accept list with multiple bookings', () => {
      const dto: BookingListResponseDto = {
        bookings: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            propertyId: 'property-1',
            userId: 'user-1',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-05'),
            totalGuests: 2,
            totalPrice: 400,
            status: 'CONFIRMED',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            propertyId: 'property-2',
            userId: 'user-2',
            startDate: new Date('2024-01-10'),
            endDate: new Date('2024-01-15'),
            totalGuests: 4,
            totalPrice: 1000,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 2,
      };
      expect(dto.bookings).toHaveLength(2);
      expect(dto.total).toBe(2);
    });

    it('should have bookings array', () => {
      const dto: BookingListResponseDto = {
        bookings: [],
        total: 0,
      };
      expect(Array.isArray(dto.bookings)).toBe(true);
    });

    it('should have total count', () => {
      const dto: BookingListResponseDto = {
        bookings: [],
        total: 10,
      };
      expect(dto.total).toBe(10);
      expect(typeof dto.total).toBe('number');
    });
  });

  describe('BookingCalendarDto', () => {
    it('should accept available calendar entry', () => {
      const dto: BookingCalendarDto = {
        date: new Date('2024-01-01'),
        available: true,
      };
      expect(dto.available).toBe(true);
      expect(dto.date).toBeInstanceOf(Date);
    });

    it('should accept unavailable calendar entry with bookingId', () => {
      const dto: BookingCalendarDto = {
        date: new Date('2024-01-01'),
        available: false,
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(dto.available).toBe(false);
      expect(dto.bookingId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept calendar entry with price', () => {
      const dto: BookingCalendarDto = {
        date: new Date('2024-01-01'),
        available: true,
        price: 150,
      };
      expect(dto.price).toBe(150);
    });

    it('should accept calendar entry with all optional fields', () => {
      const dto: BookingCalendarDto = {
        date: new Date('2024-01-01'),
        available: false,
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        price: 150,
      };
      expect(dto.bookingId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(dto.price).toBe(150);
    });
  });

  describe('BookingAvailabilityDto', () => {
    it('should accept availability with empty calendar', () => {
      const dto: BookingAvailabilityDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        calendar: [],
      };
      expect(dto.calendar).toHaveLength(0);
    });

    it('should accept availability with calendar entries', () => {
      const dto: BookingAvailabilityDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        calendar: [
          {
            date: new Date('2024-01-01'),
            available: true,
            price: 150,
          },
          {
            date: new Date('2024-01-02'),
            available: false,
            bookingId: '550e8400-e29b-41d4-a716-446655440000',
            price: 150,
          },
        ],
      };
      expect(dto.calendar).toHaveLength(2);
      expect(dto.propertyId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should have propertyId field', () => {
      const dto: BookingAvailabilityDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        startDate: new Date(),
        endDate: new Date(),
        calendar: [],
      };
      expect(typeof dto.propertyId).toBe('string');
    });

    it('should have startDate and endDate as Date', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      const dto: BookingAvailabilityDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        startDate: start,
        endDate: end,
        calendar: [],
      };
      expect(dto.startDate).toBe(start);
      expect(dto.endDate).toBe(end);
    });

    it('should have calendar array', () => {
      const dto: BookingAvailabilityDto = {
        propertyId: '550e8400-e29b-41d4-a716-446655440000',
        startDate: new Date(),
        endDate: new Date(),
        calendar: [],
      };
      expect(Array.isArray(dto.calendar)).toBe(true);
    });
  });
});
