import React, { useState } from 'react';

interface SettingsProps {
  noResponseDays: number;
  onNoResponseDaysChange: (days: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ noResponseDays, onNoResponseDaysChange }) => {
  const [localNoResponseDays, setLocalNoResponseDays] = useState(noResponseDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNoResponseDaysChange(localNoResponseDays);
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
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default Settings;