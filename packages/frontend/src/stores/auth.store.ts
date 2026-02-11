import { create } from 'zustand';

type AuthState = {
  token: string;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || '',
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem('token');
    set({ token: '' });
  },
}));
