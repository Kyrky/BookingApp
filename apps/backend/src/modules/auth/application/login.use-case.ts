import { UserRepository, BcryptAdapter, User } from "@repo/shared";
import { LoginDto } from "../interfaces/auth.dto";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptAdapter: BcryptAdapter
  ) {}

  async execute(dto: LoginDto): Promise<{ user: User; token: string }> {
    console.log(`[LOGIN] Finding user: ${dto.email}`);
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      console.log(`[LOGIN] User not found: ${dto.email}`);
      throw new Error("Invalid credentials");
    }

    console.log(`[LOGIN] Verifying password for: ${dto.email}`);
    const isValid = await this.bcryptAdapter.compare(dto.password, user.password);
    if (!isValid) {
      console.log(`[LOGIN] Invalid password for: ${dto.email}`);
      throw new Error("Invalid credentials");
    }

    console.log(`[LOGIN] Login successful: ${user.id}`);
    return { user, token: "" }; // Token will be generated in controller
  }
}
