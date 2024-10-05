import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <button className="nav-link active btn btn-link text-start w-100">
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link text-start w-100">
              Add Application
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link text-start w-100">
              View Applications
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link text-start w-100">
              Reports
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;