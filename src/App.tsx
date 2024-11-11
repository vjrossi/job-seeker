import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Navbar, Nav, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './App.css';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ConfirmationModal from './components/modals/ConfirmationModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocalStorage } from './hooks/useLocalStorage';

type ViewType = 'dashboard' | 'view' | 'reports' | 'instructions' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const hash = window.location.hash.slice(1);
    return (hash as ViewType) || 'view';
  });
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [pendingView, setPendingView] = useState<ViewType | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const navbarToggleRef = useRef<HTMLButtonElement>(null);
  const [noResponseDays, setNoResponseDays] = useLocalStorage('noResponseDays', 14);
  const [stalePeriod, setStalePeriod] = useState(30);

  useEffect(() => {
    const handleHashChange = () => {
      const newView = window.location.hash.slice(1) as ViewType;
      if (newView && isFormDirty) {
        setShowLeaveConfirmation(true);
        setPendingView(newView);
      } else if (newView) {
        setCurrentView(newView);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isFormDirty]);

  const handleViewChange = useCallback((newView: ViewType) => {
    if (isFormDirty) {
      setShowLeaveConfirmation(true);
      setPendingView(newView);
    } else {
      setCurrentView(newView);
      window.location.hash = `#${newView}`;
    }
    setExpanded(false);
  }, [isFormDirty]);

  const handleLeaveConfirmation = () => {
    setShowLeaveConfirmation(false);
    if (pendingView) {
      setCurrentView(pendingView);
      window.location.hash = `#${pendingView}`;
      setPendingView(null);
    }
    setIsFormDirty(false);
  };

  const handleLeaveCancellation = () => {
    setShowLeaveConfirmation(false);
    setPendingView(null);
    window.location.hash = `#${currentView}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expanded) {
        const navbar = document.querySelector('.navbar-collapse');
        const toggleButton = document.querySelector('.navbar-toggler');
        
        if (navbar && toggleButton && 
            !navbar.contains(event.target as Node) && 
            !toggleButton.contains(event.target as Node)) {
          setExpanded(false);
        }
      }
    };

    if (expanded) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [expanded]);

  const demoModeTooltip = (
    <Tooltip id="demo-mode-tooltip">
      {isDev 
        ? "Currently using sample data. Click to switch to your real data." 
        : "Try the app with sample data. Click to switch to demo mode."}
    </Tooltip>
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        bg="primary" 
        expand="lg" 
        variant="dark" 
        fixed="top"
        expanded={expanded}
        onToggle={(expand) => setExpanded(expand)}
      >
        <Container fluid>
          <Navbar.Brand href="#">Zynergy</Navbar.Brand>
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            ref={navbarToggleRef}
          />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                href="#view"
                active={currentView === 'view'}
                onClick={() => handleViewChange('view')}
              >
                Job Applications
              </Nav.Link>
              <Nav.Link 
                href="#dashboard" 
                active={currentView === 'dashboard'}
                onClick={() => handleViewChange('dashboard')}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link 
                href="#reports"
                active={currentView === 'reports'}
                onClick={() => handleViewChange('reports')}
              >
                Reports
              </Nav.Link>
              <Nav.Link 
                href="#settings"
                active={currentView === 'settings'}
                onClick={() => handleViewChange('settings')}
              >
                Settings
              </Nav.Link>
              <Nav.Link 
                href="#instructions"
                active={currentView === 'instructions'}
                onClick={() => handleViewChange('instructions')}
              >
                Instructions
              </Nav.Link>
            </Nav>
            <OverlayTrigger
              placement="bottom"
              overlay={demoModeTooltip}
            >
              <Button 
                variant={isDev ? "warning" : "outline-light"}
                size="sm"
                onClick={() => setIsDev(!isDev)}
                className="ms-2"
              >
                {isDev ? "Demo Mode Is On" : "Demo Mode Is Off"}
              </Button>
            </OverlayTrigger>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1 mt-5 pt-3">
        <Container fluid>
          <MainContent 
            currentView={currentView} 
            setIsFormDirty={setIsFormDirty}
            isDev={isDev}
            noResponseDays={noResponseDays}
            onNoResponseDaysChange={setNoResponseDays}
            stalePeriod={stalePeriod}
            onStalePeriodChange={setStalePeriod}
          />
        </Container>
      </main>
      
      <Footer />
      <ConfirmationModal
        show={showLeaveConfirmation}
        onClose={handleLeaveCancellation}
        onConfirm={handleLeaveConfirmation}
        message="You have unsaved changes. Are you sure you want to leave this page?"
      />
    </div>
  );
}

export default App;