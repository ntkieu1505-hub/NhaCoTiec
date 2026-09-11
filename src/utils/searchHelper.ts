import { Order } from '../types/order';
import { ORDER_STAGES } from './constants';

export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function matchQuery(source: string | number | undefined | null, query: string): boolean {
  if (source === undefined || source === null) return false;
  const q = String(query).trim().toLowerCase();
  if (!q) return true;

  const s = String(source).trim().toLowerCase();

  // 1. Direct substring match
  if (s.includes(q)) return true;

  // 2. Hash-stripped match (#NCT1136 matches NCT1136 and vice versa)
  const cleanQ = q.replace(/^#+/, '');
  const cleanS = s.replace(/^#+/, '');
  if (cleanQ && cleanS.includes(cleanQ)) return true;
  if (cleanQ && s.includes(cleanQ)) return true;
  if (('#' + cleanS).includes(q)) return true;

  // 3. Accent-free match (e.g. 'duc minh' matches 'Đức Minh')
  const rawS = removeDiacritics(s);
  const rawQ = removeDiacritics(q);
  const rawCleanQ = removeDiacritics(cleanQ);
  if (rawS.includes(rawQ)) return true;
  if (rawCleanQ && rawS.includes(rawCleanQ)) return true;

  return false;
}

export function matchOrder(ord: Order, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  if (matchQuery(ord.id, q)) return true;
  if (matchQuery('#' + ord.id, q)) return true;
  if (matchQuery(ord.customerName, q)) return true;
  if (matchQuery(ord.customerPhone, q)) return true;
  if (matchQuery(ord.customerEmail, q)) return true;
  if (matchQuery(ord.templateName, q)) return true;
  if (matchQuery(ord.price, q)) return true;
  if (matchQuery(String(ord.price), q)) return true;
  if (matchQuery(ord.orderStatus, q)) return true;
  if (matchQuery(ord.paymentStatus, q)) return true;

  const stageMeta = ORDER_STAGES[ord.currentStage];
  if (stageMeta && matchQuery(stageMeta.name, q)) return true;

  if (ord.paymentStatus === 'paid' && matchQuery('Đã thanh toán', q)) return true;
  if (ord.paymentStatus === 'unpaid' && matchQuery('Chờ thanh toán', q)) return true;
  if (ord.paymentStatus === 'unpaid' && matchQuery('Chưa thanh toán', q)) return true;
  if (ord.paymentStatus === 'pending_confirmation' && matchQuery('Chờ xác nhận', q)) return true;

  if (ord.weddingInfo) {
    if (matchQuery(ord.weddingInfo.groomName, q)) return true;
    if (matchQuery(ord.weddingInfo.brideName, q)) return true;
    if (matchQuery(ord.weddingInfo.venueName, q)) return true;
  }

  return false;
}
