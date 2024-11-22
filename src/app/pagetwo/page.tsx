'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { fetchComponents, fetchConfigs, fetchRoles, getAllStyles, updateConfig } from '@/services/api-service';
import { StyleConfig2 } from '@/types/api-types';

interface Component {
  id: number;
  name: string;
  subjects: null;
}

interface Role {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: null;
  groupRoles: null;
  roleSubjectStyles: null;
}

interface Style {
  id: number;
  name: string;
  description: string;
  subjectStyles: null;
}

function UserManagement() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const [components, setComponents] = useState<Component[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [availableStyles, setAvailableStyles] = useState<Style[]>([]);
  const [styleConfigs, setStyleConfigs] = useState<StyleConfig2[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [componentsData, rolesData, stylesData] = await Promise.all([
          fetchComponents(),
          fetchRoles(),
          getAllStyles()
        ]);
        
        setComponents(componentsData);
        setRoles(rolesData);
        setAvailableStyles(stylesData);
      } catch (error) {
        setError('Failed to fetch initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedComponent || !selectedRole) {
      setError('Please select both Component and Role');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const configs = await fetchConfigs(selectedComponent, selectedRole);
      setStyleConfigs(configs);
    } catch (error) {
      setError('Failed to fetch style configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = async (config: StyleConfig2, newStyleId: number) => {
    try {
      if (!config.style) {
        setError('Cannot update null style configuration');
        return;
      }

      await updateConfig(config.style.subjectStyleId, newStyleId);

      setStyleConfigs(prevConfigs =>
        prevConfigs.map(prevConfig =>
          prevConfig.subjectId === config.subjectId
            ? {
                ...prevConfig,
                style: {
                    ...prevConfig.style!,
                    styleId: newStyleId,
                    styleName: availableStyles.find(s => s.id === newStyleId)?.name || '',
                    styleDescription: availableStyles.find(s => s.id === newStyleId)?.description || ''
                }
              }
            : prevConfig
        )
      );
    } catch (error) {
      setError('Failed to update style configuration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Component
              </label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Component</option>
                {components.map((component) => (
                  <option key={component.id} value={component.id}>
                    {component.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-none">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {styleConfigs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UI Element Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Style
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {styleConfigs.map((config) => (
                  <tr key={config.subjectId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {config.uiElementClassName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={config.style?.styleId || ''}
                        onChange={(e) => handleStyleChange(config, Number(e.target.value))}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Style</option>
                        {availableStyles.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

UserManagement.displayName = 'UserManagement';

export default UserManagement;