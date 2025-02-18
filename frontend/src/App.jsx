import React from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import FeaturesSection from './components/FeaturesSection';
import Header from './components/Header';
import ProjectDetails from './components/ProjectDetails';

function App() {
  return (
    <div className={'container'}>
      <Header />
      <ControlPanel />
      <div className={'infoSection'}>
        <div className={'infoContainer'}>
          <ProjectDetails />
          <FeaturesSection />
        </div>
      </div>
    </div>
  );
}

export default App;
