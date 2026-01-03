import { UserRepository, BcryptAdapter, UserRole, User, CreateUserData, logger } from "@repo/shared";
import { RegisterDto } from "../interfaces/auth.dto";

const authLogger = logger.child({ context: "AUTH" });

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptAdapter: BcryptAdapter
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: User; token: string }> {
    authLogger.info("Registration attempt", { email: dto.email });

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      authLogger.warn("Registration failed - user already exists", { email: dto.email });
      throw new Error("User already exists");
    }

    const hashedPassword = await this.bcryptAdapter.hash(dto.password);

    const userData: CreateUserData = {
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: UserRole.USER,
    };

    const user = await this.userRepository.create(userData);
    authLogger.info("User created successfully", { userId: user.id, email: dto.email });

    return { user, token: "" }; // Token will be generated in controller
  }
}
