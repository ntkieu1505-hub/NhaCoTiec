import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { useOrders } from '../../../mocks/orderStore';
import { useAuth, ADMIN_EMAILS } from '../../../mocks/authStore';
import { db } from '../../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { User } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';
import { matchQuery } from '../../../utils/searchHelper';
import { AdminOutletContext } from '../../../components/layouts/AdminLayout';

export function isValidUserPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const clean = phone.trim();
  if (
    !clean ||
    clean === 'Chưa cung cấp' ||
    clean === 'Chưa có' ||
    clean === '0901 000 999' ||
    clean === '0901000999' ||
    clean === '0900000000' ||
    clean === '0900 000 000' ||
    clean === '0982 123 456' ||
    clean === '0912 888 999' ||
    clean === 'i' ||
    clean === '-'
  ) {
    return false;
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

export const AdminUsersPage: React.FC = () => {
  const outletCtx = useOutletContext<AdminOutletContext>() || {};
  const orders = useOrders();
  const { user: currentAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || outletCtx.searchQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Live Firestore users subscription
  const [firestoreUsers, setFirestoreUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!db) return;
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const list: User[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const email = String(data.email || '').trim();
            const role =
              data.role === 'Admin' ||
              data.role === 'admin' ||
              ADMIN_EMAILS.some((e) => e.toLowerCase() === email.toLowerCase())
                ? 'admin'
                : 'customer';

            const rawPhone = typeof data.phone === 'string' ? data.phone.trim() : '';
            const phone = isValidUserPhone(rawPhone) ? rawPhone : undefined;

            list.push({
              id: docSnap.id,
              fullName:
                data.fullName ||
                data.fullname ||
                data.name ||
                (role === 'admin' ? 'Quản trị viên Nhà Có Tiệc' : (email.split('@')[0] || 'Khách hàng')),
              phone,
              email,
              role,
              orderCount: 0,
              status: data.status === 'inactive' ? 'inactive' : 'active',
              createdAt: data.createdAt
                ? typeof data.createdAt === 'string'
                  ? data.createdAt
                  : data.createdAt?.toDate
                  ? data.createdAt.toDate().toISOString()
                  : new Date().toISOString()
                : new Date().toISOString(),
              lastLogin: data.updatedAt
                ? typeof data.updatedAt === 'string'
                  ? data.updatedAt
                  : data.updatedAt?.toDate
                  ? data.updatedAt.toDate().toISOString()
                  : undefined
                : undefined,
            });
          });
          setFirestoreUsers(list);
        },
        (err) => {
          console.warn('Error syncing users from Firestore:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to setup Firestore users listener:', e);
    }
  }, []);

  // Dynamic real-time user list generated from Firestore users + actual orders + current admin
  const realUsers = useMemo<User[]>(() => {
    const userMap = new Map<string, User>();

    // 1. Current Administrator (strictly real phone, never a fake default!)
    if (currentAdmin && currentAdmin.email) {
      const emailKey = currentAdmin.email.trim().toLowerCase();
      const adminPhone = isValidUserPhone(currentAdmin.phone) ? currentAdmin.phone?.trim() : undefined;
      userMap.set(emailKey, {
        id: currentAdmin.id || 'admin-01',
        fullName: currentAdmin.name || 'Quản trị viên Nhà Có Tiệc',
        phone: adminPhone,
        email: currentAdmin.email,
        role: 'admin',
        orderCount: 0,
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        lastLogin: new Date().toISOString(),
      });
    }

    // 2. Real registered users loaded live from Firestore
    firestoreUsers.forEach((fu) => {
      const key = (fu.email || fu.id).trim().toLowerCase();
      if (!key) return;

      if (!userMap.has(key)) {
        userMap.set(key, { ...fu });
      } else {
        const existing = userMap.get(key)!;
        if (!existing.phone && fu.phone) existing.phone = fu.phone;
        if (fu.fullName && existing.fullName === 'Quản trị viên Nhà Có Tiệc') {
          existing.fullName = fu.fullName;
        }
      }
    });

    // 3. Customers derived from actual orders
    orders.forEach((ord) => {
      const emailKey = (ord.customerEmail || '').trim().toLowerCase();
      const phoneKey = isValidUserPhone(ord.customerPhone) ? ord.customerPhone?.trim() : '';
      const orderPhone = isValidUserPhone(ord.customerPhone) ? ord.customerPhone?.trim() : undefined;
      const orderName = (ord.customerName || '').trim();

      // Attempt to match existing user by email or phone
      let matchedKey: string | undefined;
      if (emailKey && userMap.has(emailKey)) {
        matchedKey = emailKey;
      } else if (phoneKey) {
        for (const [k, u] of userMap.entries()) {
          if (u.phone && u.phone === phoneKey) {
            matchedKey = k;
            break;
          }
        }
      }

      if (matchedKey) {
        const item = userMap.get(matchedKey)!;
        item.orderCount += 1;
        if (!item.phone && orderPhone) {
          item.phone = orderPhone;
        }
        if (ord.createdAt && (!item.createdAt || new Date(ord.createdAt) < new Date(item.createdAt))) {
          item.createdAt = ord.createdAt;
        }
      } else if (emailKey || phoneKey || orderName) {
        // Guest user who placed an order
        const guestKey = emailKey || phoneKey || `guest-${ord.id}`;
        if (!userMap.has(guestKey)) {
          userMap.set(guestKey, {
            id: `usr-${ord.id}`,
            fullName: orderName || 'Khách hàng',
            phone: orderPhone,
            email: ord.customerEmail || '',
            role: 'customer',
            orderCount: 1,
            status: 'active',
            createdAt: ord.createdAt,
            lastLogin: ord.updatedAt || ord.createdAt,
          });
        } else {
          userMap.get(guestKey)!.orderCount += 1;
        }
      }
    });

    return Array.from(userMap.values());
  }, [orders, currentAdmin, firestoreUsers]);

  useEffect(() => {
    if (outletCtx.searchQuery !== undefined && outletCtx.searchQuery !== searchQuery) {
      setSearchQuery(outletCtx.searchQuery);
    }
  }, [outletCtx.searchQuery]);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
      outletCtx.setSearchQuery?.(q);
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    outletCtx.setSearchQuery?.(val);
    if (val.trim()) {
      setSearchParams({ search: val.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const filteredUsers = useMemo(() => {
    return realUsers.filter((usr) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchName = matchQuery(usr.fullName, q);
        const matchPhone = isValidUserPhone(usr.phone) ? matchQuery(usr.phone, q) : false;
        const matchEmail = matchQuery(usr.email, q);
        const matchRole = matchQuery(usr.role === 'admin' ? 'Quản trị viên Admin' : 'Khách hàng', q);
        if (!matchName && !matchPhone && !matchEmail && !matchRole) return false;
      }
      return true;
    });
  }, [realUsers, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-deep-espresso">
            05. Quản Lý Người Dùng
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Danh sách tài khoản cô dâu, chú rể và đội ngũ quản trị Studio
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-surface-card rounded-2xl p-3 sm:p-4 border border-border-delicate shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo họ tên, số điện thoại, email, vai trò..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-surface-subtle border border-border-delicate text-xs text-deep-espresso placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-burgundy-wine focus:border-burgundy-wine"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-deep-espresso"
              title="Xóa tìm kiếm"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>
            Hiển thị: <strong>{filteredUsers.length}</strong> / {realUsers.length} người dùng
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-burgundy-wine font-semibold hover:underline text-[11px]"
            >
              (Xóa lọc)
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-xs border border-border-delicate overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-subtle/50 border-b border-border-delicate text-text-muted font-label-caps uppercase text-[10px]">
              <th className="py-3 px-4">Họ và tên</th>
              <th className="py-3 px-4">Liên hệ (SĐT / Email)</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Số đơn hàng</th>
              <th className="py-3 px-4">Đăng nhập gần nhất</th>
              <th className="py-3 px-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-delicate">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="search_off" className="text-3xl text-text-muted/50" />
                    <span className="font-semibold text-deep-espresso">Không tìm thấy người dùng phù hợp</span>
                    <span className="text-xs text-text-muted">
                      Không có tài khoản nào khớp với từ khóa "{searchQuery}".
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="mt-2 px-4 py-1.5 rounded-full bg-surface-subtle text-burgundy-wine text-xs font-semibold hover:bg-surface-cream border border-border-delicate"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-surface-subtle/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-deep-espresso">
                    {usr.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">
                    {isValidUserPhone(usr.phone) ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-deep-espresso">{usr.phone}</span>
                        {usr.email && (
                          <span className="text-[11px] text-text-muted">{usr.email}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold text-deep-espresso">
                          {usr.email || 'Chưa cung cấp email'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                          <Icon name="mail" className="text-[12px] text-amber-700" />
                          <span>Đăng nhập qua Email • Chưa thiết lập SĐT</span>
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps font-bold uppercase ${
                        usr.role === 'admin'
                          ? 'bg-burgundy-wine text-white'
                          : 'bg-surface-subtle text-deep-espresso border border-border-delicate'
                      }`}
                    >
                      {usr.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-deep-espresso">
                    {usr.orderCount} đơn
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">
                    {usr.lastLogin ? formatDateTime(usr.lastLogin) : 'Chưa đăng nhập'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>Hoạt động</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
