import bcrypt from "bcrypt";
import { BcryptAdapter } from "@repo/shared";

export class BcryptAdapterImpl implements BcryptAdapter {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
