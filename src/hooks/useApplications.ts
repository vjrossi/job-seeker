import { useState, useEffect, useCallback } from 'react';
import { JobApplication } from '../types/JobApplication';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';

export const useApplications = (isDev: boolean) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const dbService = isDev ? devIndexedDBService : indexedDBService;

  const refreshApplications = useCallback(async () => {
    try {
      console.log('Fetching applications from:', isDev ? 'dev DB' : 'production DB');
      const apps = await dbService.getAllApplications();
      console.log('Retrieved applications:', {
        count: apps.length,
        isDev,
        firstApp: apps[0] ? { id: apps[0].id, company: apps[0].companyName } : 'none'
      });
      setApplications(apps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      // Initialize with empty array on error
      setApplications([]);
    }
  }, [dbService, isDev]);

  useEffect(() => {
    console.log('useApplications effect triggered. isDev:', isDev);
    refreshApplications();
  }, [refreshApplications, isDev]);

  // Add a debug log when applications state changes
  useEffect(() => {
    console.log('Applications state updated:', {
      count: applications.length,
      isDev,
      source: isDev ? 'dev DB' : 'production DB'
    });
  }, [applications, isDev]);

  return { applications, refreshApplications };
}; 