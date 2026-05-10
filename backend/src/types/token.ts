import type { Role } from "../auth/user.model";

export interface TokenUser {
  userId: string;
  role: Role;
  name: string;
}

export interface AccessTokenPayload {
  user: TokenUser;
}

export interface RefreshTokenPayload {
  user: TokenUser;
  refreshToken: string;
}
