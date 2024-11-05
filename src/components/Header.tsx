import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-primary text-white p-3">
      <div className="d-flex align-items-center">
        <button
          className="btn btn-outline-light me-3"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className="mb-0">Job Seeker Helper</h1>
      </div>
    </header>
  );
};

export default Header;