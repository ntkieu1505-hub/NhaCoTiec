import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Core Public - loaded immediately for lightning fast initial homepage load
import { PublicLayout } from '../components/layouts/PublicLayout';
import { HomePage } from '../features/public/pages/HomePage';
import { RouteErrorBoundary } from '../components/common/RouteErrorBoundary';
import { AdminRoute, CustomerRoute } from '../components/auth/ProtectedRoute';

// Loading spinner fallback for lazy-loaded sections
const PageLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-burgundy-wine border-t-transparent animate-spin" />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

// Lazy Loaded Secondary Public Pages
const TemplatesPage = lazy(() => import('../features/public/pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const TemplateDetailPage = lazy(() => import('../features/public/pages/TemplateDetailPage').then(m => ({ default: m.TemplateDetailPage })));
const OrderWeddingInfoPage = lazy(() => import('../features/public/pages/OrderWeddingInfoPage').then(m => ({ default: m.OrderWeddingInfoPage })));
const ContactPage = lazy(() => import('../features/public/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('../features/public/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/public/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const CheckoutQrPage = lazy(() => import('../features/public/pages/CheckoutQrPage').then(m => ({ default: m.CheckoutQrPage })));

// Lazy Loaded Customer Pages
const CustomerLayout = lazy(() => import('../components/layouts/CustomerLayout').then(m => ({ default: m.CustomerLayout })));
const CustomerDashboardPage = lazy(() => import('../features/customer/pages/CustomerDashboardPage').then(m => ({ default: m.CustomerDashboardPage })));
const CustomerOrderDetailPage = lazy(() => import('../features/customer/pages/CustomerOrderDetailPage').then(m => ({ default: m.CustomerOrderDetailPage })));
const CustomerAccountPage = lazy(() => import('../features/customer/pages/CustomerAccountPage').then(m => ({ default: m.CustomerAccountPage })));

// Lazy Loaded Admin Pages (Heavy CMS & Management panels)
const AdminLayout = lazy(() => import('../components/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverviewPage = lazy(() => import('../features/admin/pages/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })));
const AdminOrdersPage = lazy(() => import('../features/admin/pages/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('../features/admin/pages/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })));
const AdminInvitationsPage = lazy(() => import('../features/admin/pages/AdminInvitationsPage').then(m => ({ default: m.AdminInvitationsPage })));
const AdminTemplatesPage = lazy(() => import('../features/admin/pages/AdminTemplatesPage').then(m => ({ default: m.AdminTemplatesPage })));
const AdminUsersPage = lazy(() => import('../features/admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminGuestsWishesPage = lazy(() => import('../features/admin/pages/AdminGuestsWishesPage').then(m => ({ default: m.AdminGuestsWishesPage })));
const AdminAnalyticsPage = lazy(() => import('../features/admin/pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminCmsPage = lazy(() => import('../features/admin/pages/AdminCmsPage').then(m => ({ default: m.AdminCmsPage })));
const AdminSettingsPage = lazy(() => import('../features/admin/pages/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminPaymentSettingsPage = lazy(() => import('../features/admin/pages/AdminPaymentSettingsPage').then(m => ({ default: m.AdminPaymentSettingsPage })));
const AdminNotificationsPage = lazy(() => import('../features/admin/pages/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })));

export const router = createBrowserRouter([
  // 1. PUBLIC WEBSITE
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'mau-thiep', element: withSuspense(TemplatesPage) },
      { path: 'mau-thiep/:slug', element: withSuspense(TemplateDetailPage) },
      { path: 'lien-he', element: withSuspense(ContactPage) },
      { path: 'dang-nhap', element: withSuspense(LoginPage) },
      { path: 'dang-ky', element: withSuspense(RegisterPage) },
      {
        element: <CustomerRoute />,
        children: [
          { path: 'dat-thiep/:slug', element: withSuspense(OrderWeddingInfoPage) },
          { path: 'thanh-toan/:orderId', element: withSuspense(CheckoutQrPage) },
        ],
      },
    ],
  },

  // 2. CUSTOMER DASHBOARD (Protected)
  {
    path: '/dashboard',
    element: <CustomerRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: withSuspense(CustomerLayout),
        children: [
          { index: true, element: withSuspense(CustomerDashboardPage) },
          { path: 'don-hang/:orderId', element: withSuspense(CustomerOrderDetailPage) },
          { path: 'thong-tin-dang-nhap', element: withSuspense(CustomerAccountPage) },
        ],
      },
    ],
  },

  // 3. ADMIN DASHBOARD (Protected by Admin Email Allowlist)
  {
    path: '/admin',
    element: <AdminRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: withSuspense(AdminLayout),
        children: [
          { index: true, element: <Navigate to="/admin/tong-quan" replace /> },
          { path: 'tong-quan', element: withSuspense(AdminOverviewPage) },
          { path: 'don-hang', element: withSuspense(AdminOrdersPage) },
          { path: 'don-hang/:orderId', element: withSuspense(AdminOrderDetailPage) },
          { path: 'thiep', element: withSuspense(AdminInvitationsPage) },
          { path: 'mau-thiep', element: withSuspense(AdminTemplatesPage) },
          { path: 'nguoi-dung', element: withSuspense(AdminUsersPage) },
          { path: 'khach-moi-loi-chuc', element: withSuspense(AdminGuestsWishesPage) },
          { path: 'khach-tham-du', element: <Navigate to="/admin/khach-moi-loi-chuc" replace /> },
          { path: 'loi-chuc', element: <Navigate to="/admin/khach-moi-loi-chuc" replace /> },
          { path: 'thong-bao', element: withSuspense(AdminNotificationsPage) },
          { path: 'phan-tich', element: withSuspense(AdminAnalyticsPage) },
          { path: 'quan-ly-noi-dung', element: withSuspense(AdminCmsPage) },
          { path: 'cai-dat', element: withSuspense(AdminSettingsPage) },
          { path: 'cai-dat-thanh-toan', element: withSuspense(AdminPaymentSettingsPage) },
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
