export type AuthRole = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  phone?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isLoading?: boolean;
}
