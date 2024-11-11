import { JobApplication } from '../types/JobApplication';

const DEV_DB_NAME = 'JobApplicationTrackerDev';
const DEV_STORE_NAME = 'dummyApplications';
const DEV_DB_VERSION = 1;

class DevIndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async initDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DEV_DB_NAME, DEV_DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(DEV_STORE_NAME)) {
          db.createObjectStore(DEV_STORE_NAME, { keyPath: 'id' });
        }
      };
    });

    return this.initPromise;
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  async clearAllApplications(): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllApplications(): Promise<JobApplication[]> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readonly');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addApplication(application: JobApplication): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.add(application);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateApplication(application: JobApplication): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.put(application);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteApplication(id: number): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DEV_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(DEV_STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const devIndexedDBService = new DevIndexedDBService();