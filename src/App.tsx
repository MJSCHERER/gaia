import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from '@/components/ui/sonner';

// Import i18n
import './i18n';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Components
import LoadingScreen from '@/components/LoadingScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const ArtworkDetailPage = lazy(() => import('@/pages/ArtworkDetailPage'));
const ArtistPage = lazy(() => import('@/pages/ArtistPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const PurchasesPage = lazy(() => import('@/pages/account/PurchasesPage'));
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const Devtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({ default: mod.ReactQueryDevtools }))
);

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { i18n } = useTranslation();
  const { language, dir } = i18n;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir();
  }, [language, dir]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Main Layout Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/artwork/:slug" element={<ArtworkDetailPage />} />
                <Route path="/artist/:slug" element={<ArtistPage />} />
                <Route path="/cart" element={<CartPage />} />
              </Route>

              {/* Auth Layout Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/account/profile" element={<ProfilePage />} />
                  <Route path="/account/purchases" element={<PurchasesPage />} />
                  <Route path="/account/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Route>
              </Route>

              {/* OAuth Callback */}
              <Route path="/auth/callback" element={<OAuthCallback />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
      <Toaster position="top-right" richColors />
      {import.meta.env.MODE === 'development' && (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

// OAuth Callback Handler
function OAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const expiresIn = params.get('expiresIn');

    if (accessToken) {
      // Store token and redirect
      // This will be handled by the auth store
      window.opener?.postMessage(
        { type: 'OAUTH_SUCCESS', accessToken, expiresIn },
        window.location.origin,
      );
      window.close();
    } else {
      window.location.href = '/login?error=oauth_failed';
    }
  }, []);

  return <LoadingScreen message="Completing authentication..." />;
}

export default App;
