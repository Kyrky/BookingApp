import { UserRepository, BcryptAdapter, UserRole, User, CreateUserData } from "@repo/shared";
import { RegisterDto } from "../interfaces/auth.dto";

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptAdapter: BcryptAdapter
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await this.bcryptAdapter.hash(dto.password);

    // Create user
    const userData: CreateUserData = {
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: UserRole.USER,
    };

    const user = await this.userRepository.create(userData);

    return { user, token: "" }; // Token will be generated in controller
  }
}
