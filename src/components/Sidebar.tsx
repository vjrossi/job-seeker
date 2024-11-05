import React from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'view' | 'reports' | 'instructions';
  onViewChange: (view: 'dashboard' | 'view' | 'reports' | 'instructions') => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'view', label: 'View Applications' },
    { id: 'reports', label: 'Reports' },
    { id: 'instructions', label: 'Instructions' }
  ] as const;

  const handleNavClick = (view: typeof currentView) => {
    window.location.hash = `#${view}`;
    onViewChange(view);
  };

  return (
    <nav className="bg-light sidebar">
      <div className="position-sticky pt-3">
        <div className="d-flex justify-content-between align-items-center px-3 mb-3">
          <h5 className="mb-0">Menu</h5>
          <button
            className="btn btn-link text-dark p-0"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
        <ul className="nav flex-column">
          {navItems.map(item => (
            <li key={item.id} className="nav-item">
              <a 
                className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;