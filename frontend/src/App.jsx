import React, { useState } from 'react';
import './App.css';
import Controls from './components/Controls/Controls';
import ForecastGraph from './components/ForecastGraph/ForecastGraph';
import Header from './components/Header/Header';

function App() {
  const [projectId, setProjectId] = useState(null);
  const [dashboardView, setDashboardView] = useState('explore');
  const [nMonths, setNMonths] = useState('8'); // TODO: set to minimum # months

  // TODO: Move from CSS sheets to styled() components
  // TODO: use MUI Typography for text boxes, Box for divs

  return (
    <>
      <div className="root-grid">
        <div className="header">
          <Header projectState={[projectId, setProjectId]} />
        </div>
        <div className="controls">
          <Controls
            dashboardViewState={[dashboardView, setDashboardView]}
            nMonthsState={[nMonths, setNMonths]}
          />
        </div>
        <div className="forecast-graph">
          <ForecastGraph />
        </div>
        <div className="card-1-container">
          <div className="project-details-card">Placeholder text</div>
        </div>
        <div className="card-2-container">
          <div className="month-details-card">Placeholder text</div>
        </div>
      </div>
    </>
  );
}

export default App;
