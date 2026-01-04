import { DomainError } from "./domain.error";

export class BookingNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Booking with id "${id}" not found`);
  }
}
