import { UserRepository, BcryptAdapter, User } from "@repo/shared";
import { LoginDto } from "../interfaces/auth.dto";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptAdapter: BcryptAdapter
  ) {}

  async execute(dto: LoginDto): Promise<{ user: User; token: string }> {
    // Find user
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValid = await this.bcryptAdapter.compare(dto.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return { user, token: "" }; // Token will be generated in controller
  }
}
