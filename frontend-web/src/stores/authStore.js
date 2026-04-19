import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_STORAGE_KEY = 'mediflow.auth';

const sanitizePersistedAuth = () => {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return;
  try {
    JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('mediflow.accessToken');
  }
};

sanitizePersistedAuth();

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken }) => {
        localStorage.setItem('mediflow.accessToken', accessToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      updateAccessToken: (accessToken) => {
        localStorage.setItem('mediflow.accessToken', accessToken);
        set({ accessToken });
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('mediflow.accessToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({
        user: s.user,
        refreshToken: s.refreshToken,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
