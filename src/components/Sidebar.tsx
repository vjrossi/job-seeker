import React from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'add' | 'view' | 'reports';
  onViewChange: (view: 'dashboard' | 'add' | 'view' | 'reports') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <a className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} href="#" onClick={() => onViewChange('dashboard')}>
              Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${currentView === 'add' ? 'active' : ''}`} href="#" onClick={() => onViewChange('add')}>
              Add Application
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${currentView === 'view' ? 'active' : ''}`} href="#" onClick={() => onViewChange('view')}>
              View Applications
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${currentView === 'reports' ? 'active' : ''}`} href="#" onClick={() => onViewChange('reports')}>
              Reports
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;