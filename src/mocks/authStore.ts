import { useState, useEffect } from 'react';
import { AuthUser, AuthState } from '../types/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
  'haiyenng4598@gmail.com',
  'tranthihuyentrang07122005@gmail.com',
  ...((import.meta as any).env?.VITE_ADMIN_EMAILS
    ? String((import.meta as any).env.VITE_ADMIN_EMAILS).split(',').map((e: string) => e.trim().toLowerCase())
    : []),
];

export const BLOCKED_ADMIN_EMAILS: string[] = [
  'admin@nhacotiec',
  'admin@nhacotiec.vn',
  'admin@nhacotiec.com',
];

/**
 * Check if an email belongs to an authorized Admin
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (BLOCKED_ADMIN_EMAILS.some((b) => normalized === b || normalized.startsWith('admin@nhacotiec'))) {
    return false;
  }
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

const PROFILES_STORAGE_KEY = 'nha_co_tiec_user_profiles_v1';

function getStoredProfiles(): Record<string, Partial<AuthUser>> {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredProfile(userId: string, data: Partial<AuthUser>) {
  try {
    const profiles = getStoredProfiles();
    profiles[userId] = { ...profiles[userId], ...data };
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {}
}

/**
 * Sync user profile to Firestore `users` collection without fake phone numbers
 */
export function syncUserToFirestore(authUser: AuthUser) {
  if (!db || !authUser?.id || !authUser?.email) return;
  try {
    const payload: Record<string, any> = {
      email: authUser.email,
      fullName: authUser.name,
      role: authUser.role === 'admin' ? 'Admin' : 'Customer',
      updatedAt: new Date().toISOString(),
    };
    if (authUser.phone && authUser.phone.trim()) {
      payload.phone = authUser.phone.trim();
    }
    setDoc(doc(db, 'users', authUser.id), payload, { merge: true }).catch((err) => {
      console.warn('Failed to sync user doc to Firestore:', err);
    });
  } catch (e) {
    console.warn('syncUserToFirestore error:', e);
  }
}

/**
 * Update customer profile (name, phone)
 */
export async function updateCustomerProfile(userId: string, data: { name?: string; phone?: string }): Promise<void> {
  saveStoredProfile(userId, data);
  if (currentUser && currentUser.id === userId) {
    currentUser = {
      ...currentUser,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    };
    notify();
    syncUserToFirestore(currentUser);
  }
}

/**
 * Map Firebase User object to our app AuthUser type
 */
function mapFirebaseUser(user: FirebaseUser): AuthUser {
  const isAdmin = isAdminEmail(user.email);
  const storedProfile = getStoredProfiles()[user.uid] || {};
  return {
    id: user.uid,
    email: user.email || '',
    name: storedProfile.name || user.displayName || (isAdmin ? 'Quản Trị Viên Nhà Có Tiệc' : (user.email?.split('@')[0] || 'Khách hàng')),
    role: isAdmin ? 'admin' : 'customer',
    phone: storedProfile.phone || user.phoneNumber || undefined,
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
    const email = firebaseUser.email?.trim().toLowerCase() || '';
    if (BLOCKED_ADMIN_EMAILS.some((b) => email === b || email.startsWith('admin@nhacotiec'))) {
      signOut(auth).catch(() => {});
      currentUser = null;
    } else {
      currentUser = mapFirebaseUser(firebaseUser);
      syncUserToFirestore(currentUser);
    }
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
  const normalizedEmail = email.trim().toLowerCase();
  if (BLOCKED_ADMIN_EMAILS.some((b) => normalizedEmail === b || normalizedEmail.startsWith('admin@nhacotiec'))) {
    throw new Error('Tài khoản này đã bị thu hồi quyền truy cập trang quản trị. Vui lòng đăng nhập bằng email quản trị viên cá nhân đã được cấp phép.');
  }

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
  updateCustomerProfile: typeof updateCustomerProfile;
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
    updateCustomerProfile,
  };
}
