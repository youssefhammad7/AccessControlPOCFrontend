'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getElementByStyleId } from '@/utils/elementFinder';
import { getComponentName } from '@/utils/component-utils';
import { fetchStyles } from '@/services/api-service';
import { StyleConfig } from '@/types/api-types';
import '@/styles/input-styles.css';
import axios, { AxiosError } from 'axios';

function PageOne() {
  const { logout } = useAuth();
  const [styleConfigs, setStyleConfigs] = useState<StyleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const styleApplied = useRef(false);
  const [formData, setFormData] = useState({
    textBox1: '',
    textBox2: '',
    dropdown: 'option1',
    checkbox: false,
  });

  // Function takes an array of StyleConfig objects and returns a cleanup function
const applyStyles = (styles: StyleConfig[]) => {
    // Array to store cleanup functions for removing event listeners
    const cleanupFunctions: (() => void)[] = [];
  
    // Iterate through each style configuration in the styles array
    styles.forEach(styleConfig => {
      // Find DOM element using the custom data-style-id attribute
      const element = getElementByStyleId(styleConfig.uiElementClassName);
      
      // Only proceed if element is found
      if (element) {
        // Add the new style class to the element
        element.classList.add(styleConfig.styleName);
  
      }
    });
  
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchAndApplyStyles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const componentName = getComponentName(PageOne);
        const styles = await fetchStyles(componentName);
        setStyleConfigs(styles);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          setError(axiosError.message || 'An error occurred while fetching styles');
        } else {
          setError('An unexpected error occurred');
        }
        console.error('Error applying styles:', error);
      }
    };

    fetchAndApplyStyles();

    return () => {
      controller.abort();
    };
  }, []);

  // Apply styles when styleConfigs changes
  useEffect(() => {
    if (styleConfigs.length > 0 && !styleApplied.current) {
      const cleanup = applyStyles(styleConfigs);
      styleApplied.current = true;
      return cleanup;
    }
  }, [styleConfigs]);

  // Re-apply styles after DOM updates
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (styleConfigs.length > 0) {
        applyStyles(styleConfigs);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [styleConfigs]);

  const dropdownOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading styles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Page One</h2>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>    
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Text Box 1</label>
                <input
                  type="text"
                  name="textBox1"
                  value={formData.textBox1}
                  onChange={handleChange}
                  data-style-id="s1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Text Box 2</label>
                <input
                  type="text"
                  name="textBox2"
                  value={formData.textBox2}
                  onChange={handleChange}
                  data-style-id="s2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dropdown</label>
                <select
                  name="dropdown"
                  value={formData.dropdown}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                >
                  {dropdownOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="checkbox"
                  checked={formData.checkbox}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Checkbox Option
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

PageOne.displayName = 'PageOne';

export default PageOne;