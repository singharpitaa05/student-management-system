import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance.js';

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const downloadFile = async (url, filename) => {
    setExporting(true);
    setError(null);
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob' // Important for binary data
      });

      // Create blob link to download
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return { downloadFile, exporting, error };
};
