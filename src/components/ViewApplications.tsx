import React, { useState, useMemo, useEffect, useRef } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { Button, Modal } from 'react-bootstrap';
import './ViewApplications.css';
import { devIndexedDBService } from '../services/devIndexedDBService';
import Toast from './Toast';
import JobCard from './JobCard';
import StandardJobCard from './standard/StandardJobCard';
import SearchBar from './search/SearchBar';
import FilterSection from './filters/FilterSection';
import ApplicationModals from './modals/ApplicationModals';
import { indexedDBService } from '../services/indexedDBService';
import { FaFilter } from 'react-icons/fa';

interface ViewApplicationsProps {
  applications: JobApplication[];
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onEdit: (application: JobApplication) => void;
  onAddApplication: () => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilters: ApplicationStatus[];
  onStatusFilterChange: (status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  isTest: boolean;
  refreshApplications: () => void;
  onUndo: (id: number) => void;
  stalePeriod: number;
  onRatingChange: (applicationId: number, newRating: number) => void;
  layoutType: 'standard' | 'experimental';
}

const ViewApplications: React.FC<ViewApplicationsProps> = ({
  applications,
  onStatusChange,
  onEdit,
  onAddApplication,
  searchTerm,
  onSearchChange,
  statusFilters,
  onStatusFilterChange,
  onDelete,
  isTest,
  onUndo,
  refreshApplications,
  stalePeriod,
  onRatingChange,
  layoutType
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [applicationToArchive, setApplicationToArchive] = useState<number | null>(null);
  const [tooltipVisibility, setTooltipVisibility] = useState<{ [key: number]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<number | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Add ref for filter button
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter((app: JobApplication) => {
        const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
        const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(currentStatus);
        const matchesArchiveFilter = showArchived 
          ? true 
          : !app.archived;
        
        return matchesSearch && matchesStatus && matchesArchiveFilter;
      })
      .sort((a: JobApplication, b: JobApplication) => {
        const aDate = new Date(a.statusHistory[0].timestamp);
        const bDate = new Date(b.statusHistory[0].timestamp);
        return bDate.getTime() - aDate.getTime();
      });
  }, [applications, searchTerm, statusFilters, showArchived]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Applications filtered:', {
        totalApplications: applications.length,
        searchTerm: searchTerm || 'none',
        activeFilters: statusFilters.length || 'none',
        resultCount: filteredAndSortedApplications.length
      });
    }
  }, [filteredAndSortedApplications.length, applications.length, searchTerm, statusFilters.length]);

  const handleArchiveClick = (appId: number) => {
    setApplicationToArchive(appId);
    setShowArchiveModal(true);
  };

  const handleArchiveConfirm = () => {
    if (applicationToArchive !== null) {
      onDelete(applicationToArchive);
    }
    setShowArchiveModal(false);
    setApplicationToArchive(null);
  };

  const handleDisabledArchiveClick = (appId: number) => {
    setTooltipVisibility(prev => ({ ...prev, [appId]: true }));
    setTimeout(() => {
      setTooltipVisibility(prev => ({ ...prev, [appId]: false }));
    }, 2000);
  };

  const handleDeleteConfirm = async () => {
    if (applicationToDelete !== null) {
      try {
        await (isTest ? devIndexedDBService : indexedDBService).deleteApplication(applicationToDelete);
        refreshApplications();
        setToast({
          show: true,
          message: 'Application permanently deleted',
          type: 'success'
        });
      } catch (error) {
        console.error('Error deleting application:', error);
        setToast({
          show: true,
          message: 'Failed to delete application',
          type: 'error'
        });
      }
    }
    setShowDeleteModal(false);
    setApplicationToDelete(null);
  };

  const handleArchiveIconTouchStart = (appId: number, e: React.TouchEvent) => {
    e.preventDefault();
    setApplicationToDelete(appId);
    setShowDeleteModal(true);
  };

  const handleArchiveIconTouchEnd = () => {
    // Add any cleanup if needed
  };

  const renderApplication = (application: JobApplication) => {
    const props = {
      application,
      onEdit,
      onDelete,
      onStatusChange,
      onUndo,
      tooltipVisibility,
      onArchiveClick: handleArchiveClick,
      onDisabledArchiveClick: handleDisabledArchiveClick,
      onArchiveIconTouchStart: handleArchiveIconTouchStart,
      onArchiveIconTouchEnd: handleArchiveIconTouchEnd,
      onRatingChange
    };

    return layoutType === 'experimental' ? (
      <JobCard
        key={application.id}
        {...props}
        expandedId={expandedCardId}
        onExpand={(id) => setExpandedCardId(currentId => currentId === id ? null : id)}
      />
    ) : (
      <StandardJobCard
        key={application.id}
        {...props}
      />
    );
  };

  // Add this effect to update the position
  useEffect(() => {
    if (showFilters && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty('--filter-button-top', `${rect.top}px`);
    }
  }, [showFilters]);

  return (
    <div className="view-applications">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Job Applications {isTest && '(Test Mode)'}</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={onAddApplication}>
            Add New
          </Button>
          <Button 
            ref={filterButtonRef}
            variant="outline-secondary" 
            onClick={() => setShowFilters(true)}
            className="d-lg-none"
          >
            <FaFilter />
          </Button>
        </div>
      </div>

      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      
      <div className="d-none d-lg-block">
        <FilterSection
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          statusFilters={statusFilters}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>

      <div>
        {applications.length === 0 && !searchTerm && !statusFilters.length ? (
          <div className="text-center py-5">
            <h4 className="text-muted mb-3">No applications yet</h4>
            <p className="mb-4">Start tracking your job search by clicking the "Add New" button above</p>
          </div>
        ) : filteredAndSortedApplications.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted mb-3">No matching applications</h4>
            <p className="mb-4">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="applications-grid">
            {filteredAndSortedApplications.map(renderApplication)}
          </div>
        )}
      </div>

      <Modal 
        show={showFilters} 
        onHide={() => setShowFilters(false)}
        size="sm"
        aria-labelledby="filter-modal"
        dialogClassName="filter-modal"
        style={{
          position: 'absolute',
          top: '60px',
          right: '20px',
          margin: 0
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="filter-modal">Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FilterSection
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            statusFilters={statusFilters}
            onStatusFilterChange={onStatusFilterChange}
            isMobile={true}
          />
        </Modal.Body>
      </Modal>

      <ApplicationModals
        showArchiveModal={showArchiveModal}
        showDeleteModal={showDeleteModal}
        onArchiveHide={() => setShowArchiveModal(false)}
        onDeleteHide={() => setShowDeleteModal(false)}
        onArchiveConfirm={handleArchiveConfirm}
        onDeleteConfirm={handleDeleteConfirm}
      />

      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default ViewApplications;