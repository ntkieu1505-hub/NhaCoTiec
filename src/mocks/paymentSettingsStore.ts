import { useState, useEffect } from 'react';
import { PaymentSettings } from '../types/payment';

const STORAGE_KEY = 'nha_co_tiec_payment_settings_v1';

// Clean, high-fidelity default static QR image (SVG encoded as Data URL for offline reliability)
export const DEFAULT_STATIC_QR_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

// Fallback high-contrast QR mockup SVG data URI
export const FALLBACK_QR_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <rect width="300" height="300" fill="#ffffff" rx="16"/>
      <rect x="20" y="20" width="80" height="80" fill="#1b120c" rx="8"/>
      <rect x="35" y="35" width="50" height="50" fill="#ffffff" rx="4"/>
      <rect x="47" y="47" width="26" height="26" fill="#7d1620" rx="3"/>
      <rect x="200" y="20" width="80" height="80" fill="#1b120c" rx="8"/>
      <rect x="215" y="35" width="50" height="50" fill="#ffffff" rx="4"/>
      <rect x="227" y="47" width="26" height="26" fill="#7d1620" rx="3"/>
      <rect x="20" y="200" width="80" height="80" fill="#1b120c" rx="8"/>
      <rect x="35" y="215" width="50" height="50" fill="#ffffff" rx="4"/>
      <rect x="47" y="227" width="26" height="26" fill="#7d1620" rx="3"/>
      <rect x="120" y="25" width="20" height="20" fill="#1b120c"/>
      <rect x="150" y="40" width="25" height="15" fill="#7d1620"/>
      <rect x="115" y="70" width="30" height="20" fill="#1b120c"/>
      <rect x="160" y="80" width="20" height="20" fill="#1b120c"/>
      <rect x="40" y="120" width="25" height="25" fill="#1b120c"/>
      <rect x="80" y="130" width="20" height="20" fill="#7d1620"/>
      <rect x="115" y="115" width="70" height="70" fill="#fdfbf9" rx="12" stroke="#b48c48" stroke-width="2"/>
      <text x="150" y="157" font-family="serif" font-size="16" font-weight="bold" fill="#7d1620" text-anchor="middle">NCT</text>
      <rect x="200" y="120" width="30" height="20" fill="#1b120c"/>
      <rect x="245" y="130" width="25" height="25" fill="#7d1620"/>
      <rect x="125" y="200" width="20" height="30" fill="#1b120c"/>
      <rect x="160" y="220" width="30" height="20" fill="#7d1620"/>
      <rect x="210" y="210" width="35" height="25" fill="#1b120c"/>
      <rect x="220" y="250" width="40" height="20" fill="#1b120c"/>
      <rect x="135" y="255" width="25" height="25" fill="#7d1620"/>
    </svg>
  `);

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  accountHolder: 'NGUYEN VAN A',
  accountNumber: '0982123456',
  transferSyntax: 'NCT01',
  qrImageUrl: FALLBACK_QR_DATA_URI,
  paymentNote: 'Vui lòng ghi đúng mã đơn hàng trong nội dung chuyển khoản để hệ thống ghi nhận đối soát chính xác.',
  isActive: true,
  updatedAt: new Date().toISOString(),
};

let currentPaymentSettings: PaymentSettings = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load payment settings from localStorage', e);
  }
  return DEFAULT_PAYMENT_SETTINGS;
})();

const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPaymentSettings));
  } catch (e) {
    console.error('Failed to save payment settings to localStorage', e);
  }
  listeners.forEach((fn) => fn());
}

export function getPaymentSettings(): PaymentSettings {
  return { ...currentPaymentSettings };
}

export function updatePaymentSettings(data: Partial<PaymentSettings>): PaymentSettings {
  currentPaymentSettings = {
    ...currentPaymentSettings,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  notify();
  return { ...currentPaymentSettings };
}

export function uploadQrImage(dataUrl: string): PaymentSettings {
  currentPaymentSettings = {
    ...currentPaymentSettings,
    qrImageUrl: dataUrl,
    updatedAt: new Date().toISOString(),
  };
  notify();
  return { ...currentPaymentSettings };
}

export function resetPaymentSettings(): PaymentSettings {
  currentPaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS };
  notify();
  return { ...currentPaymentSettings };
}

export function usePaymentSettings(): PaymentSettings {
  const [settings, setSettings] = useState<PaymentSettings>(getPaymentSettings);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getPaymentSettings());
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return settings;
}
