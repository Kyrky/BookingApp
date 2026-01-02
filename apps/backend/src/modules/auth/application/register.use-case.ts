import { UserRepository, BcryptAdapter, UserRole, User, CreateUserData } from "@repo/shared";
import { RegisterDto } from "../interfaces/auth.dto";

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptAdapter: BcryptAdapter
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: User; token: string }> {
    console.log(`[REGISTER] Checking if user exists: ${dto.email}`);
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      console.log(`[REGISTER] User already exists: ${dto.email}`);
      throw new Error("User already exists");
    }

    console.log(`[REGISTER] Hashing password for: ${dto.email}`);
    const hashedPassword = await this.bcryptAdapter.hash(dto.password);

    const userData: CreateUserData = {
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: UserRole.USER,
    };

    console.log(`[REGISTER] Creating user: ${dto.email}`);
    const user = await this.userRepository.create(userData);
    console.log(`[REGISTER] User created successfully: ${user.id}`);

    return { user, token: "" }; // Token will be generated in controller
  }
}
