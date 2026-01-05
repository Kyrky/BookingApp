import { IBookingRepository, Booking } from "@repo/shared";

export class GetBookingsByUserUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.findByUserId(userId);
  }
}
