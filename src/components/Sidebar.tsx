import React from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'view' | 'reports' | 'instructions';
  onViewChange: (view: 'dashboard' | 'view' | 'reports' | 'instructions') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <a 
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} 
              href="#" 
              onClick={() => onViewChange('dashboard')}
            >
              Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link ${currentView === 'view' ? 'active' : ''}`} 
              href="#" 
              onClick={() => onViewChange('view')}
            >
              View Applications
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link ${currentView === 'reports' ? 'active' : ''}`} 
              href="#" 
              onClick={() => onViewChange('reports')}
            >
              Reports
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link ${currentView === 'instructions' ? 'active' : ''}`} 
              href="#" 
              onClick={() => onViewChange('instructions')}
            >
              Instructions
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;