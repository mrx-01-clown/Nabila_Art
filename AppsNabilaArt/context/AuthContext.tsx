import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// ==================== Types ====================
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, 'name' | 'phone' | 'address'>>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

// ==================== API Base URL ====================
const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

// ==================== Context ====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = !!user && !!token;

  // -------- Login --------
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login gagal.' };
      }

      setUser(data.data.user);
      setToken(data.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.' };
    } finally {
      setIsLoading(false);
    }
  };

  // -------- Register --------
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone?.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registrasi gagal.' };
      }

      setUser(data.data.user);
      setToken(data.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.' };
    } finally {
      setIsLoading(false);
    }
  };

  // -------- Logout --------
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // -------- Update Profile --------
  const updateProfile = async (
    data: Partial<Pick<User, 'name' | 'phone' | 'address'>>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Tidak ada sesi aktif.' };
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Gagal memperbarui profil.' };
      }

      setUser(result.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Tidak dapat terhubung ke server.' };
    } finally {
      setIsLoading(false);
    }
  };

  // -------- Refresh User from server --------
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setUser(data.data);
    } catch {
      // Diam-diam gagal, user data tetap dari state
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isLoggedIn, login, register, logout, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
