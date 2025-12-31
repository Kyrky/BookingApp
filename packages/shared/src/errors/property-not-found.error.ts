import { DomainError } from "./domain.error";

export class PropertyNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Property with id "${id}" not found`);
  }
}
