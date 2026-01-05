import { IBookingRepository, Booking, IPropertyRepository, PropertyNotFoundError, ValueError } from "@repo/shared";

export interface CreateBookingInput {
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalGuests: number;
}

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private propertyRepository: IPropertyRepository
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    // Check if property exists
    const property = await this.propertyRepository.findById(input.propertyId);
    if (!property) {
      throw new PropertyNotFoundError(input.propertyId);
    }

    // Check for overlapping bookings
    const overlappingBookings = await this.bookingRepository.findOverlappingBookings(
      input.propertyId,
      input.startDate,
      input.endDate
    );

    if (overlappingBookings.length > 0) {
      throw new ValueError("Property is not available for the selected dates");
    }

    // Calculate total price
    const days = Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = property.getPricePerNight().toNumber() * days;

    // Create booking
    const booking = Booking.create({
      propertyId: input.propertyId,
      userId: input.userId,
      startDate: input.startDate,
      endDate: input.endDate,
      totalGuests: input.totalGuests,
      totalPrice,
      status: undefined, // Will default to PENDING
    });

    return await this.bookingRepository.save(booking);
  }
}
