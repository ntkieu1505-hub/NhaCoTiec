import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layouts/PublicLayout';
import { CustomerLayout } from '../components/layouts/CustomerLayout';
import { AdminLayout } from '../components/layouts/AdminLayout';

// Public Pages
import { HomePage } from '../features/public/pages/HomePage';
import { TemplatesPage } from '../features/public/pages/TemplatesPage';
import { TemplateDetailPage } from '../features/public/pages/TemplateDetailPage';
import { OrderWeddingInfoPage } from '../features/public/pages/OrderWeddingInfoPage';
import { ContactPage } from '../features/public/pages/ContactPage';
import { LoginPage } from '../features/public/pages/LoginPage';
import { RegisterPage } from '../features/public/pages/RegisterPage';
import { CheckoutQrPage } from '../features/public/pages/CheckoutQrPage';

// Customer Pages
import { CustomerDashboardPage } from '../features/customer/pages/CustomerDashboardPage';
import { CustomerOrderDetailPage } from '../features/customer/pages/CustomerOrderDetailPage';
import { CustomerAccountPage } from '../features/customer/pages/CustomerAccountPage';

// Admin Pages
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage';
import { AdminOrdersPage } from '../features/admin/pages/AdminOrdersPage';
import { AdminOrderDetailPage } from '../features/admin/pages/AdminOrderDetailPage';
import { AdminInvitationsPage } from '../features/admin/pages/AdminInvitationsPage';
import { AdminTemplatesPage } from '../features/admin/pages/AdminTemplatesPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminGuestsWishesPage } from '../features/admin/pages/AdminGuestsWishesPage';
import { AdminAnalyticsPage } from '../features/admin/pages/AdminAnalyticsPage';
import { AdminCmsPage } from '../features/admin/pages/AdminCmsPage';
import { AdminSettingsPage } from '../features/admin/pages/AdminSettingsPage';
import { AdminPaymentSettingsPage } from '../features/admin/pages/AdminPaymentSettingsPage';
import { AdminNotificationsPage } from '../features/admin/pages/AdminNotificationsPage';
import { AdminRoute, CustomerRoute } from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  // 1. PUBLIC WEBSITE
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'mau-thiep', element: <TemplatesPage /> },
      { path: 'mau-thiep/:slug', element: <TemplateDetailPage /> },
      { path: 'dat-thiep/:slug', element: <OrderWeddingInfoPage /> },
      { path: 'lien-he', element: <ContactPage /> },
      { path: 'dang-nhap', element: <LoginPage /> },
      { path: 'dang-ky', element: <RegisterPage /> },
      { path: 'thanh-toan/:orderId', element: <CheckoutQrPage /> },
    ],
  },

  // 2. CUSTOMER DASHBOARD (Protected)
  {
    path: '/dashboard',
    element: <CustomerRoute />,
    children: [
      {
        element: <CustomerLayout />,
        children: [
          { index: true, element: <CustomerDashboardPage /> },
          { path: 'don-hang/:orderId', element: <CustomerOrderDetailPage /> },
          { path: 'thong-tin-dang-nhap', element: <CustomerAccountPage /> },
        ],
      },
    ],
  },

  // 3. ADMIN DASHBOARD (Protected by Admin Email Allowlist)
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/tong-quan" replace /> },
          { path: 'tong-quan', element: <AdminOverviewPage /> },
          { path: 'don-hang', element: <AdminOrdersPage /> },
          { path: 'don-hang/:orderId', element: <AdminOrderDetailPage /> },
          { path: 'thiep', element: <AdminInvitationsPage /> },
          { path: 'mau-thiep', element: <AdminTemplatesPage /> },
          { path: 'nguoi-dung', element: <AdminUsersPage /> },
          { path: 'khach-moi-loi-chuc', element: <AdminGuestsWishesPage /> },
          { path: 'khach-tham-du', element: <Navigate to="/admin/khach-moi-loi-chuc" replace /> },
          { path: 'loi-chuc', element: <Navigate to="/admin/khach-moi-loi-chuc" replace /> },
          { path: 'thong-bao', element: <AdminNotificationsPage /> },
          { path: 'phan-tich', element: <AdminAnalyticsPage /> },
          { path: 'quan-ly-noi-dung', element: <AdminCmsPage /> },
          { path: 'cai-dat', element: <AdminSettingsPage /> },
          { path: 'cai-dat-thanh-toan', element: <AdminPaymentSettingsPage /> },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
