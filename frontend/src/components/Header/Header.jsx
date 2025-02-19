import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import React from 'react';
import './index.css';
export default function Header() {
  return (
    <div className="header-container">
      <div>
        <h1>ASFI Project Sustainability Simulator</h1>
      </div>
      <div className="links">
        <Link
          className="link"
          href="https://arxiv.org/abs/2105.14252"
          target="_blank"
          rel="noopener"
        >
          Yin et al.
        </Link>
        <Link
          className="link"
          href="http://zenodo.org/records/4564072"
          target="_blank"
          rel="noopener"
        >
          Original Models/Data
        </Link>
        <IconButton
          className="link"
          onClick={() =>
            window.open('https://github.com/linuslyt/OSSSustainabilitySim')
          }
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          onClick={() =>
            window.open(
              'https://github.com/linuslyt/OSSSustainabilitySim/blob/main/frontend/README.md',
            )
          }
        >
          <HelpIcon />
        </IconButton>
      </div>
    </div>
  );
}
