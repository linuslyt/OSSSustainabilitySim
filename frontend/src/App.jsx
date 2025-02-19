import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <div className="root-grid">
        <div className="header">
          <Header />
        </div>
        <div className="controls"></div>
        <div className="forecast-graph"></div>
        <div className="card-1"></div>
        <div className="card-2"></div>
      </div>
    </>
  );
}

export default App;
