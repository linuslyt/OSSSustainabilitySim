import React from 'react';
import '../App.css';
import FeaturesColumn from './FeaturesColumn';
import StatsColumn from './StatsColumn';

export default function FeaturesSection() {
  return (
    <div className={'featuresSection'}>
      <div className={'featuresContent'}>
        <div className={'featuresContainer'}>
          <FeaturesColumn />
          <StatsColumn />
        </div>
      </div>
    </div>
  );
}
