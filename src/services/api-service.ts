// services/api-service.ts
import axiosInstance from '@/services/axios';
import { StyleConfig } from '@/types/api-types';
import { API_ENDPOINTS } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const fetchStyles = async (componentName: string): Promise<StyleConfig[]> => {
  try {
    const response = await axiosInstance.get<StyleConfig[]>(`${API_ENDPOINTS.userHTMLElementConfig}`, {
      params: {
        componentName,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching styles:', error);
    return [];
  }
};