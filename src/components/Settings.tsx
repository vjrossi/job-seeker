import React, { useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
import { JobApplication } from '../types/JobApplication';
import ExportImport from './ExportImport';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';
import './Settings.css';

interface SettingsProps {
  isDev: boolean;
  noResponseDays: number;
  onNoResponseDaysChange: (days: number) => void;
  stalePeriod: number;
  onStalePeriodChange: (days: number) => void;
  applications: JobApplication[];
  onApplicationsUpdate: () => void;
  onError: (message: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  isDev,
  noResponseDays,
  onNoResponseDaysChange,
  stalePeriod,
  onStalePeriodChange,
  applications,
  onApplicationsUpdate,
  onError
}) => {
  const handleImport = async (importedApplications: JobApplication[]) => {
    const dbService = isDev ? devIndexedDBService : indexedDBService;
    
    try {
      // Clear existing applications
      const existingApps = await dbService.getAllApplications();
      for (const app of existingApps) {
        await dbService.deleteApplication(app.id);
      }
      
      // Import new applications
      for (const app of importedApplications) {
        await dbService.addApplication(app);
      }
      
      onApplicationsUpdate();
    } catch (error) {
      onError('Failed to import applications: ' + (error as Error).message);
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      
      <Card className="mb-4">
        <Card.Header>
          Download Job Applications
          {applications?.length > 0 && ` (${applications.length} applications)`}
        </Card.Header>
        <Card.Body>
          <ExportImport 
            applications={applications || []}
            onImport={handleImport}
            onError={(msg) => {
              console.error('Export/Import error:', msg);
              onError(msg);
            }}
          />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Application Settings</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Days until "No Response" status</Form.Label>
              <Form.Control
                type="number"
                value={noResponseDays}
                onChange={(e) => onNoResponseDaysChange(parseInt(e.target.value))}
                min={1}
                max={90}
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Days until application becomes stale</Form.Label>
              <Form.Control
                type="number"
                value={stalePeriod}
                onChange={(e) => onStalePeriodChange(parseInt(e.target.value))}
                min={1}
                max={90}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;
