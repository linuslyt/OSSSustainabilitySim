import React from 'react';
import '../App.css';

export default function Header() {
  return (
    <header className={'header'}>
      <h1 className={'title'}>OSS Sustainability Simulator</h1>
      <div className={'headerLinks'}>
        <a href="#" className={'link'}>
          link to paper
        </a>
        <a href="#" className={'link'}>
          link to original models
        </a>
        <a href="#" className={'link'}>
          link to GitHub
        </a>
        <button className={'helpButton'} aria-label="Help">
          ?
        </button>
      </div>
    </header>
  );
}
