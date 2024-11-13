import React, { useRef, useEffect } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { JobApplication } from '../types/JobApplication';
import { exportToHTML, exportToJSON, downloadFile } from '../utils/exportUtils';
import { importFromJSON } from '../utils/importUtils';

interface ExportImportProps {
  applications: JobApplication[];
  onImport: (applications: JobApplication[]) => Promise<void>;
  onError: (message: string) => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ applications, onImport, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('ExportImport received applications:', applications?.length);
  }, [applications]);

  const handleExportHTML = () => {
    console.log('Attempting HTML export with:', applications?.length, 'applications');
    if (!applications?.length) {
      onError('No applications to export');
      return;
    }
    const html = exportToHTML(applications);
    const fileName = `job-applications-${new Date().toISOString().split('T')[0]}.html`;
    downloadFile(html, fileName, 'text/html');
  };

  const handleExportJSON = () => {
    console.log('Attempting JSON export with:', applications?.length, 'applications');
    if (!applications?.length) {
      onError('No applications to export');
      return;
    }
    const json = exportToJSON(applications);
    const fileName = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, fileName, 'application/json');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedApplications = await importFromJSON(text);
      await onImport(importedApplications);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="export-import-buttons">
      <ButtonGroup>
        <Button 
          variant="outline-primary" 
          onClick={handleExportHTML}
          disabled={!applications?.length}
        >
          Download for Viewing {applications?.length ? `(${applications.length})` : ''}
        </Button>
        <Button 
          variant="outline-primary" 
          onClick={handleExportJSON}
          disabled={!applications?.length}
        >
          Download a Backup {applications?.length ? `(${applications.length})` : ''}
        </Button>
        <Button 
          variant="outline-primary" 
          onClick={() => fileInputRef.current?.click()}
        >
          Import from a Backup
        </Button>
      </ButtonGroup>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ExportImport; 