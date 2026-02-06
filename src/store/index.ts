import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Cart Store
interface CartItem {
  id: string;
  artworkId: string;
  title: string;
  thumbnail: string;
  price: number;
  currency: string;
  quantity: number;
  artistName: string;
  artistSlug: string;
  isDigital: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByArtist: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.artworkId === item.artworkId
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.artworkId === item.artworkId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      getItemsByArtist: () => {
        const grouped: Record<string, CartItem[]> = {};
        get().items.forEach((item) => {
          if (!grouped[item.artistName]) {
            grouped[item.artistName] = [];
          }
          grouped[item.artistName].push(item);
        });
        return grouped;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// UI Store
interface UIState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  isLoading: boolean;
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setLoading: (isLoading: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      isLoading: false,
      toast: null,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setLoading: (isLoading) => set({ isLoading }),
      showToast: (message, type) =>
        set({ toast: { show: true, message, type } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

// Gallery Store
interface GalleryState {
  selectedArtist: string | null;
  selectedCategory: string | null;
  sortBy: string;
  viewMode: 'grid' | 'list';
  setSelectedArtist: (artist: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sort: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useGalleryStore = create<GalleryState>()((set) => ({
  selectedArtist: null,
  selectedCategory: null,
  sortBy: 'newest',
  viewMode: 'grid',
  setSelectedArtist: (artist) => set({ selectedArtist: artist }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));

// Hidden Interactions Store
interface HiddenInteractionsState {
  foundItems: string[];
  ufoFound: boolean;
  mushroomFound: boolean;
  clockFound: boolean;
  duckFound: boolean;
  markFound: (item: string) => void;
  getFoundCount: () => number;
}

export const useHiddenInteractionsStore = create<HiddenInteractionsState>()(
  persist(
    (set, get) => ({
      foundItems: [],
      ufoFound: false,
      mushroomFound: false,
      clockFound: false,
      duckFound: false,
      markFound: (item) =>
        set((state) => {
          if (state.foundItems.includes(item)) return state;
          const newState: any = {
            foundItems: [...state.foundItems, item],
          };
          if (item === 'ufo') newState.ufoFound = true;
          if (item === 'mushroom') newState.mushroomFound = true;
          if (item === 'clock') newState.clockFound = true;
          if (item === 'duck') newState.duckFound = true;
          return newState;
        }),
      getFoundCount: () => get().foundItems.length,
    }),
    {
      name: 'hidden-interactions-storage',
    }
  )
);
