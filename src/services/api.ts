import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store';

type ShippingAddress = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
};

type InteractionPayload = {
  interactionType: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data.data;
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, accessToken);

        // Retry original request
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (email: string, password: string, rememberMe?: boolean) =>
    api.post('/auth/login', { email, password, rememberMe }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (
    data: Partial<{ firstName: string; lastName: string; bio: string; avatar: string }>,
  ) => api.patch('/auth/profile', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Gallery API
export const galleryApi = {
  getGallery: (params?: {
    artist?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => api.get('/gallery', { params }),
  getFeatured: () => api.get('/gallery/featured'),
  getArtistsPreview: () => api.get('/gallery/artists-preview'),
};

// Artists API
export const artistsApi = {
  getAll: () => api.get('/artists'),
  getBySlug: (slug: string) => api.get(`/artists/${slug}`),
  getArtworks: (slug: string, params?: { page?: number; limit?: number }) =>
    api.get(`/artists/${slug}/artworks`, { params }),
  getExhibitions: (slug: string) => api.get(`/artists/${slug}/exhibitions`),
  getPublications: (slug: string) => api.get(`/artists/${slug}/publications`),
};

// Artworks API
export const artworksApi = {
  getAll: (params?: {
    category?: string;
    artist?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/artworks', { params }),
  getBySlug: (slug: string) => api.get(`/artworks/${slug}`),
  incrementView: (slug: string) => api.post(`/artworks/${slug}/view`),
};

// Cart API
export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (artworkId: string, quantity?: number) => api.post('/cart', { artworkId, quantity }),
  updateItem: (itemId: string, quantity: number) => api.patch(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => api.get('/wishlists'),
  addItem: (artworkId: string) => api.post('/wishlists', { artworkId }),
  removeItem: (artworkId: string) => api.delete(`/wishlists/${artworkId}`),
};

// Purchases API
export const purchasesApi = {
  getPurchases: () => api.get('/purchases'),
  getPurchase: (id: string) => api.get(`/purchases/${id}`),
  getDownloadLink: (itemId: string) => api.get(`/purchases/${itemId}/download`),
};

// Payments API
export const paymentsApi = {
  createIntent: (
    items: Array<{ artworkId: string; quantity: number }>,
    shippingAddress?: ShippingAddress,
  ) => api.post('/payments/create-intent', { items, shippingAddress }),
  confirmPayment: (paymentIntentId: string) => api.post('/payments/confirm', { paymentIntentId }),
  getPaymentMethods: () => api.get('/payments/methods'),
};

// Newsletter API
export const newsletterApi = {
  subscribe: (data: { email: string; firstName?: string; lastName?: string; language?: string }) =>
    api.post('/newsletter/subscribe', data),
  unsubscribe: (email: string) => api.post('/newsletter/unsubscribe', { email }),
};

// Interactions API
export const interactionsApi = {
  track: (data: InteractionPayload) => api.post('/interactions', data),
  getInteractions: () => api.get('/interactions'),
};

export default api;
