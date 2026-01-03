import { UserRepository, BcryptAdapter, User, logger } from "@repo/shared";
import { LoginDto } from "../interfaces/auth.dto";

const authLogger = logger.child({ context: "AUTH" });

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptAdapter: BcryptAdapter
  ) {}

  async execute(dto: LoginDto): Promise<{ user: User; token: string }> {
    authLogger.info("Login attempt", { email: dto.email });

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      authLogger.warn("Login failed - user not found", { email: dto.email });
      throw new Error("Invalid credentials");
    }

    const isValid = await this.bcryptAdapter.compare(dto.password, user.password);
    if (!isValid) {
      authLogger.warn("Login failed - invalid password", { email: dto.email, userId: user.id });
      throw new Error("Invalid credentials");
    }

    authLogger.info("Login successful", { userId: user.id, email: dto.email });
    return { user, token: "" }; // Token will be generated in controller
  }
}
