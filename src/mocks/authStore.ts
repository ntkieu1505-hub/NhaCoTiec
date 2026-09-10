import { useState, useEffect } from 'react';
import { AuthUser, AuthState } from '../types/auth';
import { auth, googleProvider } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';

/**
 * ADMIN EMAIL ALLOWLIST
 * Only emails included in this allowlist are granted the 'admin' role.
 * You and your authorized teammates will have full administrative privileges.
 * You can add emails directly to this array or set VITE_ADMIN_EMAILS in Vercel.
 */
export const ADMIN_EMAILS: string[] = [
  'kieumllnn@gmail.com',
  'vutrang280805@gmail.com',
  'hang07122005@gmail.com',
  'admin@nhacotiec.vn',
  ...((import.meta as any).env?.VITE_ADMIN_EMAILS
    ? String((import.meta as any).env.VITE_ADMIN_EMAILS).split(',').map((e: string) => e.trim().toLowerCase())
    : []),
];

/**
 * Check if an email belongs to an authorized Admin
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

/**
 * Map Firebase User object to our app AuthUser type
 */
function mapFirebaseUser(user: FirebaseUser): AuthUser {
  const isAdmin = isAdminEmail(user.email);
  return {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || (isAdmin ? 'Quản Trị Viên Nhà Có Tiệc' : (user.email?.split('@')[0] || 'Khách hàng')),
    role: isAdmin ? 'admin' : 'customer',
    phone: user.phoneNumber || undefined,
    avatarUrl: user.photoURL || undefined,
  };
}

let currentUser: AuthUser | null = null;
let isAuthLoading = true;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

// Global Firebase auth state listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    currentUser = mapFirebaseUser(firebaseUser);
  } else {
    currentUser = null;
  }
  isAuthLoading = false;
  notify();
});

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

/**
 * Log in with Email and Password via Firebase
 */
export async function loginWithEmail(email: string, password: string): Promise<{ user: AuthUser; redirectTo: string }> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = mapFirebaseUser(credential.user);
  currentUser = user;
  isAuthLoading = false;
  notify();
  return {
    user,
    redirectTo: user.role === 'admin' ? '/admin/tong-quan' : '/dashboard',
  };
}

/**
 * Register with Email and Password via Firebase
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ user: AuthUser; redirectTo: string }> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (e) {
      console.warn('Failed to update display name', e);
    }
  }
  const user = mapFirebaseUser(credential.user);
  currentUser = user;
  isAuthLoading = false;
  notify();
  return {
    user,
    redirectTo: user.role === 'admin' ? '/admin/tong-quan' : '/dashboard',
  };
}

/**
 * Log in with Google Account via Firebase Popup
 */
export async function loginWithGoogle(): Promise<{ user: AuthUser; redirectTo: string }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = mapFirebaseUser(credential.user);
  currentUser = user;
  isAuthLoading = false;
  notify();
  return {
    user,
    redirectTo: user.role === 'admin' ? '/admin/tong-quan' : '/dashboard',
  };
}

/**
 * Sign out from Firebase
 */
export async function logout(): Promise<void> {
  await signOut(auth);
  currentUser = null;
  isAuthLoading = false;
  notify();
}

/**
 * Compatibility wrapper
 */
export const login = loginWithEmail;

/**
 * Reactive React hook for authentication state
 */
export function useAuth(): AuthState & {
  isLoading: boolean;
  loginWithEmail: typeof loginWithEmail;
  registerWithEmail: typeof registerWithEmail;
  loginWithGoogle: typeof loginWithGoogle;
  logout: typeof logout;
} {
  const [user, setUser] = useState<AuthUser | null>(currentUser);
  const [loading, setLoading] = useState<boolean>(isAuthLoading);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(currentUser);
      setLoading(isAuthLoading);
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
    isLoading: loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  };
}
