import { JobApplication } from '../components/JobApplicationTracker';

const DEV_DB_NAME = 'JobApplicationTrackerDev';
const DEV_STORE_NAME = 'dummyApplications';
const DEV_DB_VERSION = 1;

class DevIndexedDBService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DEV_DB_NAME, DEV_DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(DEV_STORE_NAME, { keyPath: 'id' });
      };
    });
  }

  // Implement the same methods as in the original indexedDBService
  // (addApplication, getAllApplications, updateApplication, etc.)
  // but use DEV_STORE_NAME instead of STORE_NAME

  async clearAllApplications(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllApplications(): Promise<JobApplication[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readonly');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addApplication(application: JobApplication): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.add(application);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateApplication(application: JobApplication): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.put(application);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const devIndexedDBService = new DevIndexedDBService();