import React from 'react';
import '../App.css';

export default function ControlPanel() {
  return (
    <div className={'controlPanel'}>
      <div className={'projectSelector'}>
        <input
          type="text"
          className={'projectName'}
          value="Project 1 name"
          aria-label="Project name"
        />
        <span className={'dashboardMode'}>Dashboard mode:</span>
        <div className={'modeToggle'}>
          <button className={'exploreButton'}>Explore</button>
          <button className={'simulateButton'}>Simulate</button>
        </div>
      </div>
      <div className={'monthSelector'}>
        <label htmlFor="monthInput" className={'monthLabel'}>
          # Months to include:
        </label>
        <input
          type="number"
          id="monthInput"
          className={'monthInput'}
          value="20"
          aria-label="Number of months to include"
        />
      </div>
    </div>
  );
}
