import React, { useState } from 'react';

interface SettingsProps {
  noResponseDays: number;
  onNoResponseDaysChange: (days: number) => void;
  stalePeriod: number;
  onStalePeriodChange: (days: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  noResponseDays, 
  onNoResponseDaysChange, 
  stalePeriod, 
  onStalePeriodChange 
}) => {
  const [localNoResponseDays, setLocalNoResponseDays] = useState(noResponseDays);
  const [localStalePeriod, setLocalStalePeriod] = useState(stalePeriod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNoResponseDaysChange(localNoResponseDays);
    onStalePeriodChange(localStalePeriod);
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="noResponseDays" className="form-label">
            Days before application is considered "No Response":
          </label>
          <input
            type="number"
            className="form-control"
            id="noResponseDays"
            value={localNoResponseDays}
            onChange={(e) => setLocalNoResponseDays(Number(e.target.value))}
            min="1"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="stalePeriod" className="form-label">
            Days before application is considered "Becoming Stale":
          </label>
          <input
            type="number"
            className="form-control"
            id="stalePeriod"
            value={localStalePeriod}
            onChange={(e) => setLocalStalePeriod(Number(e.target.value))}
            min="1"
          />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
      <footer className="bg-light text-center p-3 mt-auto d-none d-md-block">
        <p className="mb-0">&copy; 2025 Zynergy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Settings;
