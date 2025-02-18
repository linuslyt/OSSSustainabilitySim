import React from 'react';
import '../App.css';

export default function FeaturesColumn() {
  const features = [
    { label: '# Commits:', value: '...' },
    { label: '# Files changed:', value: '...' },
    { label: '# Active developers:', value: '...' },
    { label: '# Emails sent:', value: '...' },
  ];

  const networkStats = [
    { label: '# nodes:', value: '...' },
    { label: '# edges:', value: '...' },
    { label: 'Clustering coefficient:', value: '...' },
    { label: 'Long-tailedness:', value: '...' },
    { label: 'Mean degree:', value: '...' },
  ];

  return (
    <div className={'featuresColumn'}>
      <div className={'featuresColumnContent'}>
        <h3 className={'featuresTitle'}>Features for Month 10</h3>
        <div className={'featuresList'}>
          {features.map((feature, index) => (
            <div key={index} className={'featureItem'}>
              <span className={'featureLabel'}>{feature.label}</span>
              <span>{feature.value}</span>
            </div>
          ))}
        </div>
        <h4 className={'commitNetworkTitle'}>Commit network</h4>
        <div className={networkStats}>
          {networkStats.map((stat, index) => (
            <div key={index} className={'networkStat'}>
              <span className={'networkStatLabel'}>{stat.label}</span>
              <span>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
