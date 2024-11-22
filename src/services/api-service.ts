// src/services/api-service.ts
import axiosInstance from '@/services/axios';
import { API_ENDPOINTS } from './api';
import { StyleConfig, StyleConfig2 } from '@/types/api-types';

export interface Component {
  id: number;
  name: string;
  subjects: null;
}

export interface Role {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: null;
  groupRoles: null;
  roleSubjectStyles: null;
}

export interface Style {
  id: number;
  name: string;
  description: string;
  subjectStyles: null;
}

// Keep the original fetchStyles
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

// Add new function for getting all available styles
export const getAllStyles = async (): Promise<Style[]> => {
  try {
    const response = await axiosInstance.get<Style[]>(API_ENDPOINTS.STYLES);
    return response.data;
  } catch (error) {
    console.error('Error fetching available styles:', error);
    throw error;
  }
};

export const fetchComponents = async (): Promise<Component[]> => {
  try {
    const response = await axiosInstance.get<Component[]>(API_ENDPOINTS.COMPONENTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await axiosInstance.get<Role[]>(API_ENDPOINTS.ROLES);
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// in api-service.ts
export const fetchConfigs = async (componentId: string, roleId: string): Promise<StyleConfig2[]> => {
  try {
    const response = await axiosInstance.get<StyleConfig2[]>(`${API_ENDPOINTS.CONFIGS}`, {
      params: {
        componentId,
        roleId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching configs:', error);
    throw error;
  }
};

// src/services/api-service.ts
export const updateConfig = async (
  subjectStyleId: number,
  newStyleId: number
): Promise<void> => {
  try {
    await axiosInstance.put(`${API_ENDPOINTS.userHTMLElementConfig}/${subjectStyleId}/${newStyleId}`);
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
};