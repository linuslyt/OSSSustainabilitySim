import React, { useState } from 'react';
import './App.css';
import Controls from './components/Controls/Controls';
import Header from './components/Header/Header';

function App() {
  const [projectId, setProjectId] = useState(null);
  const [dashboardView, setDashboardView] = useState('explore');
  const [nMonths, setNMonths] = useState('8'); // TODO: set to minimum # months
  return (
    <>
      <div className="root-grid">
        <div className="header">
          <Header />
        </div>
        <div className="controls">
          <Controls
            projectState={[projectId, setProjectId]}
            dashboardViewState={[dashboardView, setDashboardView]}
            nMonthsState={[nMonths, setNMonths]}
          />
        </div>
        <div className="forecast-graph"></div>
        <div className="card-1"></div>
        <div className="card-2"></div>
      </div>
    </>
  );
}

export default App;
