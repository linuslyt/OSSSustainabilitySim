import React from 'react';
import '../App.css';

export default function StatsColumn() {
  const stats = [
    { label: '% commits made by top 10% contributors:', value: '...' },
    { label: '% emails sent by top 10% contributors:', value: '...' },
    {
      label: '% of project duration of top 3 email interruptions:',
      value: '...',
    },
    {
      label: '% of project duration of top 3 commit interruptions:',
      value: '...',
    },
  ];

  const emailNetworkStats = [
    { label: '# nodes:', value: '...' },
    { label: '# edges:', value: '...' },
    { label: 'Clustering coefficient:', value: '...' },
    { label: 'Long-tailedness:', value: '...' },
    { label: 'Mean degree:', value: '...' },
  ];

  return (
    <div className={'statsColumn'}>
      <div className={'statsContent'}>
        <div className={'statsContainer'}>
          <div className={'statsSubColumn'}>
            <div className={'statsSubColumnContent'}>
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className={'statItem'}>
                  <span className={'statLabel'}>{stat.label}</span>
                  <span className={'statValue'}>{stat.value}</span>
                </div>
              ))}
              <h4 className={'emailNetworkTitle'}>Email network</h4>
              {emailNetworkStats.map((stat, index) => (
                <div key={index} className={'statItem'}>
                  <span className={'statLabel'}>{stat.label}</span>
                  <span className={'statValue'}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={'statsSubColumn'}>
            <div className={'statsSubColumnContent'}>
              {stats.slice(2).map((stat, index) => (
                <div key={index} className={'statItem'}>
                  <span className={'statLabel'}>{stat.label}</span>
                  <span className={'statValue'}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
