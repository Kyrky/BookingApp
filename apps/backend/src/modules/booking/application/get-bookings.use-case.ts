import { IBookingRepository, Booking } from "@repo/shared";

export class GetBookingsUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(): Promise<Booking[]> {
    return await this.bookingRepository.findAll();
  }
}
