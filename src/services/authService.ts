import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { API_ENDPOINTS } from './api';

// Interface matching your JWT claims
export interface JwtPayload {
  sub: string;        // User ID
  email: string;      // User Email
  jti: string;        // JWT ID
  role: string[];     // User Roles
  exp: number;        // Expiration timestamp
  iss: string;        // Issuer
  aud: string;        // Audience
}

export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface LoginCredentials {
  email: string;      // Changed from username to email
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }
    
    try {
      console.log('Token:', token);
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('Decoded token:', decoded);
      return {
        id: decoded.sub,
        email: decoded.email,
        roles: Array.isArray(decoded.role) ? decoded.role : [decoded.role]
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }
};