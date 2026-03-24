'use client';

import { api } from './api';

export interface User {
  id: string;
  uuid: string;
  type: 'patient' | 'doctor' | 'clinic_admin' | 'pharmacy' | 'admin';
  email: string;
  phone: string;
  document_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  birth_date?: string;
   specialty?: string;
   specialty_id?: string;
   mpps_number?: string;
  is_verified: boolean;
  document_verified: boolean;
  is_blocked?: boolean;
  consultation_price_usd?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  bank_document_id?: string;
  bank_account_type?: string;
  pago_movil_phone?: string;
  pago_movil_document_id?: string;
  pago_movil_bank?: string;
  zelle_email?: string;
  zelle_holder?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async register(data: {
    type: string;
    email: string;
    phone: string;
    document_id: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    birth_date?: string;
    mpps_number?: string;
    specialty?: string;
    specialty_id?: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

