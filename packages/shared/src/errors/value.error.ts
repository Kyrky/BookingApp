import { DomainError } from "./domain.error";

export class ValueError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
