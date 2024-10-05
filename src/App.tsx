import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add' | 'view' | 'reports'>('dashboard');

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <div className="container-fluid flex-grow-1">
        <div className="row h-100">
          <Sidebar onViewChange={setCurrentView} />
          <MainContent currentView={currentView} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
