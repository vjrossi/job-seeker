import React from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'view' | 'reports';
  onViewChange: (view: 'dashboard' | 'view' | 'reports') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link btn btn-link text-start w-100 ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onViewChange('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn btn-link text-start w-100 ${currentView === 'view' ? 'active' : ''}`}
              onClick={() => onViewChange('view')}
            >
              Job Applications
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn btn-link text-start w-100 ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => onViewChange('reports')}
            >
              Reports
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;