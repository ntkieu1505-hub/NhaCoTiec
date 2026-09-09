import { useState, useEffect } from 'react';
import { AuthUser, AuthState } from '../types/auth';

/**
 * ADMIN EMAIL ALLOWLIST
 * Only emails included in this allowlist are granted the 'admin' role.
 * Do NOT display or expose this allowlist publicly on the Public Website.
 * In production Firebase integration, this will be replaced with Firebase Custom Claims / Security Rules.
 */
export const ADMIN_EMAILS: string[] = [
  'authorized-admin-email@example.com',
  'admin@nhacotiec.vn',
];

export const MOCK_ADMIN_USER: AuthUser = {
  id: 'admin-001',
  email: 'authorized-admin-email@example.com',
  name: 'Quản Trị Viên Nhà Có Tiệc',
  role: 'admin',
};

export const MOCK_CUSTOMER_USER: AuthUser = {
  id: '01',
  email: 'customer@example.com',
  name: 'Nguyễn Minh Anh & Trần Đức Minh',
  phone: '0982 123 456',
  role: 'customer',
};

const STORAGE_KEY = 'nha_co_tiec_auth_session_v2';

// In-memory cache synced with localStorage
let currentUser: AuthUser | null = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load auth session from localStorage', e);
  }
  return null;
})();

const listeners = new Set<() => void>();

function notify() {
  try {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth session to localStorage', e);
  }
  listeners.forEach((fn) => fn());
}

/**
 * Check if an email is in the authorized Admin email allowlist
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

/**
 * Perform login:
 * Determines role based on Admin email allowlist.
 * If email matches allowlist -> role is 'admin' and redirects to '/admin/tong-quan'.
 * Otherwise -> role is 'customer' and redirects to '/dashboard'.
 */
export function login(email: string): { user: AuthUser; redirectTo: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const isAdmin = isAdminEmail(normalizedEmail);

  if (isAdmin) {
    currentUser = {
      id: 'admin-001',
      email: normalizedEmail,
      name: 'Quản Trị Viên Nhà Có Tiệc',
      role: 'admin',
    };
    notify();
    return { user: currentUser, redirectTo: '/admin/tong-quan' };
  } else {
    currentUser = {
      id: '01',
      email: normalizedEmail || 'customer@example.com',
      name: 'Nguyễn Minh Anh & Trần Đức Minh',
      phone: '0982 123 456',
      role: 'customer',
    };
    notify();
    return { user: currentUser, redirectTo: '/dashboard' };
  }
}

/**
 * Perform logout:
 * Clears current session and returns user to public website.
 */
export function logout(): void {
  currentUser = null;
  notify();
}

/**
 * Convenience helper to log in directly as mock customer (for development testing)
 */
export function loginAsMockCustomer(): { user: AuthUser; redirectTo: string } {
  currentUser = { ...MOCK_CUSTOMER_USER };
  notify();
  return { user: currentUser, redirectTo: '/dashboard' };
}

/**
 * Convenience helper to log in directly as mock admin (for development testing)
 */
export function loginAsMockAdmin(): { user: AuthUser; redirectTo: string } {
  currentUser = { ...MOCK_ADMIN_USER };
  notify();
  return { user: currentUser, redirectTo: '/admin/tong-quan' };
}

/**
 * Reactive React hook for authentication state
 */
export function useAuth(): AuthState & {
  login: typeof login;
  logout: typeof logout;
  loginAsMockCustomer: typeof loginAsMockCustomer;
  loginAsMockAdmin: typeof loginAsMockAdmin;
} {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getCurrentUser());
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    login,
    logout,
    loginAsMockCustomer,
    loginAsMockAdmin,
  };
}
