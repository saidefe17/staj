export type UserRole = "admin" | "customer";

export type UserProfile = {
  uid: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
};
