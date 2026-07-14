import { Request } from "express";

export type AuthenticatedUser = {
  uid: string;
  email: string | null;
  admin: boolean;
};

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
