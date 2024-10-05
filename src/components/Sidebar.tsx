import React from 'react';

interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'add' | 'view' | 'reports') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onViewChange }) => {
  return (
    <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <button className="nav-link active btn btn-link text-start w-100" onClick={() => onViewChange('dashboard')}>
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link text-start w-100" onClick={() => onViewChange('add')}>
              Add Application
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link text-start w-100" onClick={() => onViewChange('view')}>
              View Applications
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link text-start w-100" onClick={() => onViewChange('reports')}>
              Reports
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;