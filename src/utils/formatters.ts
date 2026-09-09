export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount).replace('₫', 'đ');
}

/**
 * Safely parses any date representation (Date, Firestore Timestamp {seconds, nanoseconds},
 * string, or epoch number) into a valid JavaScript Date or null.
 */
export function toSafeDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  // Firestore Timestamp with toDate() method
  if (typeof val?.toDate === 'function') {
    try {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }

  // Firestore Timestamp object: { seconds: number, nanoseconds?: number }
  if (typeof val?.seconds === 'number') {
    const d = new Date(val.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }

  // Numeric epoch timestamp (e.g. Date.now())
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO string or date string
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Safely converts any date value to an ISO 8601 string.
 */
export function toIsoDateString(val: any, fallback?: string): string {
  const defaultFallback = fallback || new Date().toISOString();
  if (!val) return defaultFallback;
  if (typeof val === 'string' && val.includes('T')) return val;
  const d = toSafeDate(val);
  return d ? d.toISOString() : (typeof val === 'string' ? val : defaultFallback);
}

export function formatDate(input: any): string {
  if (!input) return '';
  const date = toSafeDate(input);
  if (!date) {
    return typeof input === 'string' ? input : '';
  }
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return typeof input === 'string' ? input : '';
  }
}

export function formatDateTime(input: any): string {
  if (!input) return '';
  const date = toSafeDate(input);
  if (!date) {
    return typeof input === 'string' ? input : '';
  }
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return typeof input === 'string' ? input : '';
  }
}

