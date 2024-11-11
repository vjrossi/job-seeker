import { JobApplication } from './JobApplication';

export interface DBService {
    initDB(): Promise<void>;
    getAllApplications(): Promise<JobApplication[]>;
    addApplication(application: JobApplication): Promise<void>;
    updateApplication(application: JobApplication): Promise<void>;
    deleteApplication(id: number): Promise<void>;
}

export interface DBConfig {
    name: string;
    version: number;
    storeName: string;
} 