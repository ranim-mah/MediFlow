import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      name: 'mediflow.auth',
      partialize: (s) => ({
        user: s.user,
        refreshToken: s.refreshToken,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
