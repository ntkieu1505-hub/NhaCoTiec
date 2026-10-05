/**
 * Google Analytics 4 (GA4) Ecommerce & Event Tracking Service
 * Tích hợp gửi sự kiện doanh thu, xem trang và chuyển đổi cho Nhà Có Tiệc
 */

export interface PurchaseOrderData {
  id: string;
  price: number;
  templateName?: string;
  templateId?: string;
  customerName?: string;
}

/**
 * Gửi sự kiện lượt xem trang (SPA Pageview Tracking)
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: title || document.title,
    });
  }
}

/**
 * Gửi sự kiện Bắt đầu thanh toán (begin_checkout)
 */
export function trackBeginCheckout(order: PurchaseOrderData): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const amount = order.price || 79000;
    (window as any).gtag('event', 'begin_checkout', {
      currency: 'VND',
      value: amount,
      items: [
        {
          item_id: order.templateId || order.id,
          item_name: order.templateName || 'Mẫu thiệp cưới Nhà Có Tiệc',
          price: amount,
          quantity: 1,
        },
      ],
    });
  }
}

/**
 * Gửi sự kiện Mua hàng / Doanh thu thành công (purchase)
 * Sự kiện này giúp Google Analytics 4 ghi nhận doanh thu vào mục "Drive sales / Ecommerce revenue"
 */
export function trackPurchase(order: PurchaseOrderData): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const amount = order.price || 79000;
    const cacheKey = `ga_purchase_sent_${order.id}`;

    // Tránh gửi trùng lặp nhiều lần cho cùng 1 mã đơn hàng trong cùng phiên
    if (sessionStorage.getItem(cacheKey)) {
      return;
    }
    sessionStorage.setItem(cacheKey, 'true');

    (window as any).gtag('event', 'purchase', {
      transaction_id: order.id,
      value: amount,
      currency: 'VND',
      items: [
        {
          item_id: order.templateId || order.id,
          item_name: order.templateName || 'Mẫu thiệp cưới Nhà Có Tiệc',
          price: amount,
          quantity: 1,
        },
      ],
    });
  }
}
