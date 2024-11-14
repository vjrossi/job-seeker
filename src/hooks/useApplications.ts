import { useState, useEffect, useCallback } from 'react';
import { JobApplication } from '../types/JobApplication';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';

export const useApplications = (isDev: boolean) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const dbService = isDev ? devIndexedDBService : indexedDBService;

  const refreshApplications = useCallback(async () => {
    try {
      await dbService.initDB();
      const apps = await dbService.getAllApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  }, [dbService, isDev]);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications, isDev]);

  return { applications, refreshApplications };
}; 