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

interface Patient {
  patientId: string;
  patientName: string;
  ssn: string;
  deleteDisabled: boolean;
}

function PageOne() {
  const { logout } = useAuth();
  const [styleConfigs, setStyleConfigs] = useState<StyleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const styleApplied = useRef(false);
  const [formData, setFormData] = useState({
    textBox1: '',
    textBox2: '',
  });

  const [patients, setPatients] = useState<Patient[]>([
    { patientId: "P001", patientName: "John Doe", ssn: "123-45-6789", deleteDisabled: false },
    { patientId: "P002", patientName: "Jane Smith", ssn: "987-65-4321", deleteDisabled: true },
  ]);

  const applyStyles = (styles: StyleConfig[]) => {
    const cleanupFunctions: (() => void)[] = [];
    styles.forEach(styleConfig => {
      const elements = document.querySelectorAll(`[data-style-id="${styleConfig.uiElementClassName}"]`);
      elements.forEach(element => {
        if (element) {
          element.classList.add(styleConfig.styleName);
        }
      });
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

  useEffect(() => {
    if (styleConfigs.length > 0 && !styleApplied.current) {
      const cleanup = applyStyles(styleConfigs);
      styleApplied.current = true;
      return cleanup;
    }
  }, [styleConfigs]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (styleConfigs.length > 0) {
        applyStyles(styleConfigs);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [styleConfigs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(patient => patient.patientId !== patientId));
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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
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

            <div className="flex-1 min-w-[200px]">
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SSN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.patientId}>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.patientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.ssn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeletePatient(patient.patientId)}
                      disabled={patient.deleteDisabled}
                      data-style-id="s3"
                      className="px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}

PageOne.displayName = 'PageOne';

export default PageOne;