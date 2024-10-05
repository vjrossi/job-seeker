import React, { useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add' | 'view' | 'reports'>('dashboard');
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [pendingView, setPendingView] = useState<'dashboard' | 'add' | 'view' | 'reports' | null>(null);

  const handleViewChange = useCallback((newView: 'dashboard' | 'add' | 'view' | 'reports') => {
    if (isFormDirty && currentView === 'add') {
      setShowLeaveConfirmation(true);
      setPendingView(newView);
    } else {
      setCurrentView(newView);
    }
  }, [isFormDirty, currentView]);

  const handleLeaveConfirmation = () => {
    setShowLeaveConfirmation(false);
    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    }
    setIsFormDirty(false);
  };

  const handleLeaveCancellation = () => {
    setShowLeaveConfirmation(false);
    setPendingView(null);
  };

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <div className="container-fluid flex-grow-1">
        <div className="row h-100">
          <Sidebar currentView={currentView} onViewChange={handleViewChange} />
          <MainContent 
            currentView={currentView} 
            setIsFormDirty={setIsFormDirty}
          />
        </div>
      </div>
      <Footer />
      <ConfirmationModal
        show={showLeaveConfirmation}
        onClose={handleLeaveCancellation}
        onConfirm={handleLeaveConfirmation}
        message="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
      />
    </div>
  );
}

export default App;
