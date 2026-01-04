import { User, UserRole } from "../entities/user.entity";

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: CreateUserData): Promise<User>;
  update(id: string, data: Partial<CreateUserData>): Promise<User>;
  delete(id: string): Promise<void>;
}
