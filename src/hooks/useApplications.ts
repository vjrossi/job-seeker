import { useState, useCallback, useMemo } from 'react';
import { JobApplication } from '../types/JobApplication';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';

export const useApplications = (isDev: boolean) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  
  // Memoize the dbService selection
  const dbService = useMemo(() => 
    isDev ? devIndexedDBService : indexedDBService,
    [isDev]
  );

  const refreshApplications = useCallback(async () => {
    try {
      await dbService.initDB();
      const apps = await dbService.getAllApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  }, [dbService]); // Now we depend on the memoized dbService

  return { applications, refreshApplications };
}; 