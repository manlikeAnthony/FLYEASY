import { UserDocument } from "../auth/user.model";

import type { TokenUser } from "../types/token";

export const createTokenUser = (user: UserDocument): TokenUser => {
  return {
    userId: user._id.toString(),
    name: user.name,
    role: user.role,
  };
};
