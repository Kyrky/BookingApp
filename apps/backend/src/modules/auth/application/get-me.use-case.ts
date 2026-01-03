import { UserRepository, User, logger } from "@repo/shared";

const authLogger = logger.child({ context: "AUTH" });

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<User> {
    authLogger.debug("Getting user by ID", { userId });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      authLogger.warn("User not found", { userId });
      throw new Error("User not found");
    }

    authLogger.debug("User found", { userId, email: user.email });
    return user;
  }
}
