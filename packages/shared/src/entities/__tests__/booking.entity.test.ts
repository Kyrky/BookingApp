import { describe, it, expect, beforeEach } from 'vitest';
import { Booking } from '../booking.entity';
import { BookingStatus } from '../booking-status.enum';
import { ValueError } from '../../errors/value.error';

describe('Booking Entity', () => {
  describe('Creation', () => {
    it('should create booking with PENDING status by default', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      expect(booking.status).toBe(BookingStatus.PENDING);
      expect(booking.propertyId).toBe('prop-1');
      expect(booking.userId).toBe('user-1');
    });

    it('should create booking with custom status', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
        status: BookingStatus.CONFIRMED,
      });

      expect(booking.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should generate UUID if not provided', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      expect(booking.id).toBeDefined();
      expect(typeof booking.id).toBe('string');
      expect(booking.id.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should throw error if endDate is before startDate', () => {
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-10'),
          totalGuests: 2,
          totalPrice: 500,
        });
      }).toThrow(ValueError);
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-01-10'),
          totalGuests: 2,
          totalPrice: 500,
        });
      }).toThrow('End date must be after start date');
    });

    it('should throw error if endDate equals startDate', () => {
      const date = new Date('2025-01-10');
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: date,
          endDate: date,
          totalGuests: 2,
          totalPrice: 500,
        });
      }).toThrow(ValueError);
    });

    it('should throw error if totalGuests is less than 1', () => {
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
          totalGuests: 0,
          totalPrice: 500,
        });
      }).toThrow(ValueError);
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
          totalGuests: 0,
          totalPrice: 500,
        });
      }).toThrow('At least 1 guest is required');
    });

    it('should throw error if totalGuests exceeds maximum', () => {
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
          totalGuests: 51,
          totalPrice: 500,
        });
      }).toThrow(ValueError);
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
          totalGuests: 51,
          totalPrice: 500,
        });
      }).toThrow('Maximum 50 guests allowed');
    });

    it('should accept valid totalGuests range', () => {
      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
          totalGuests: 1,
          totalPrice: 500,
        });
      }).not.toThrow();

      expect(() => {
        Booking.create({
          propertyId: 'prop-1',
          userId: 'user-1',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-15'),
          totalGuests: 50,
          totalPrice: 500,
        });
      }).not.toThrow();
    });
  });

  describe('Status transitions', () => {
    let booking: Booking;

    beforeEach(() => {
      booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });
    });

    it('should confirm PENDING booking', () => {
      booking.confirm();

      expect(booking.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should not confirm non-PENDING booking', () => {
      booking.confirm(); // Now CONFIRMED

      expect(() => {
        booking.confirm();
      }).toThrow(ValueError);
      expect(() => {
        booking.confirm();
      }).toThrow('Only pending bookings can be confirmed');
    });

    it('should cancel PENDING booking', () => {
      booking.cancel();

      expect(booking.status).toBe(BookingStatus.CANCELLED);
    });

    it('should cancel CONFIRMED booking', () => {
      booking.confirm();
      booking.cancel();

      expect(booking.status).toBe(BookingStatus.CANCELLED);
    });

    it('should not cancel COMPLETED booking', () => {
      booking.confirm();
      booking.checkIn(); // Now COMPLETED

      expect(() => {
        booking.cancel();
      }).toThrow(ValueError);
      expect(() => {
        booking.cancel();
      }).toThrow('Booking cannot be cancelled in current status');
    });

    it('should check-in CONFIRMED booking', () => {
      booking.confirm();
      booking.checkIn();

      expect(booking.status).toBe(BookingStatus.COMPLETED);
    });

    it('should not check-in PENDING booking', () => {
      expect(() => {
        booking.checkIn();
      }).toThrow(ValueError);
      expect(() => {
        booking.checkIn();
      }).toThrow('Only confirmed bookings can be checked in');
    });

    it('should not check-in CANCELLED booking', () => {
      booking.cancel();

      expect(() => {
        booking.checkIn();
      }).toThrow(ValueError);
    });

    it('should check-out COMPLETED booking', () => {
      booking.confirm();
      booking.checkIn();
      const updatedAtBefore = booking.updatedAt;

      booking.checkOut();

      expect(booking.status).toBe(BookingStatus.COMPLETED);
      expect(booking.updatedAt.getTime()).toBeGreaterThanOrEqual(updatedAtBefore.getTime());
    });

    it('should not check-out non-COMPLETED booking', () => {
      expect(() => {
        booking.checkOut();
      }).toThrow(ValueError);
      expect(() => {
        booking.checkOut();
      }).toThrow('Cannot check out from non-completed booking');
    });
  });

  describe('Computed properties', () => {
    it('should calculate days correctly', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      expect(booking.getDays()).toBe(5);
    });

    it('should calculate partial days as full day', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10T10:00:00'),
        endDate: new Date('2025-01-11T06:00:00'),
        totalGuests: 2,
        totalPrice: 100,
      });

      expect(booking.getDays()).toBe(1);
    });
  });

  describe('Query methods', () => {
    it('should return true for PENDING booking', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      expect(booking.isPending()).toBe(true);
      expect(booking.isConfirmed()).toBe(false);
      expect(booking.isCancelled()).toBe(false);
      expect(booking.isCompleted()).toBe(false);
    });

    it('should return true for CONFIRMED booking', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });
      booking.confirm();

      expect(booking.isPending()).toBe(false);
      expect(booking.isConfirmed()).toBe(true);
      expect(booking.isCancelled()).toBe(false);
      expect(booking.isCompleted()).toBe(false);
    });

    it('should return true for CANCELLED booking', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });
      booking.cancel();

      expect(booking.isPending()).toBe(false);
      expect(booking.isConfirmed()).toBe(false);
      expect(booking.isCancelled()).toBe(true);
      expect(booking.isCompleted()).toBe(false);
    });

    it('should return true for COMPLETED booking', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });
      booking.confirm();
      booking.checkIn();

      expect(booking.isPending()).toBe(false);
      expect(booking.isConfirmed()).toBe(false);
      expect(booking.isCancelled()).toBe(false);
      expect(booking.isCompleted()).toBe(true);
    });

    it('should check if booking can be cancelled', () => {
      const pendingBooking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      expect(pendingBooking.canBeCancelled()).toBe(true);

      pendingBooking.confirm();
      expect(pendingBooking.canBeCancelled()).toBe(true);

      pendingBooking.checkIn();
      expect(pendingBooking.canBeCancelled()).toBe(false);
    });

    it('should check if booking is active', () => {
      const booking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      expect(booking.isActive()).toBe(true);

      booking.cancel();
      expect(booking.isActive()).toBe(false);

      const confirmedBooking = Booking.create({
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });
      confirmedBooking.confirm();
      expect(confirmedBooking.isActive()).toBe(true);

      confirmedBooking.checkIn();
      expect(confirmedBooking.isActive()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize booking correctly', () => {
      const booking = Booking.create({
        id: 'test-id',
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalGuests: 2,
        totalPrice: 500,
      });

      const json = booking.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        propertyId: 'prop-1',
        userId: 'user-1',
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalGuests: 2,
        totalPrice: 500,
        status: BookingStatus.PENDING,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      });
    });
  });
});
