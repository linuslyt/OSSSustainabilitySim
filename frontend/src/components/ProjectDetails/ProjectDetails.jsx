import { Typography } from '@mui/material';
import Link from '@mui/material/Link';
import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export default function ProjectDetails() {
  const simContext = useSimulation();
  const projectDetails = simContext.selectedProjectData.details;

  return (
    <>
      <Typography variant="h6">{projectDetails.project_name}</Typography>
      <Typography variant="body1">
        Active: {projectDetails.start_date + ' - ' + projectDetails.end_date}
      </Typography>
      <Typography variant="body1">
        Status: {projectDetails.status ? 'Graduated' : 'Retired'}
      </Typography>
      <Typography variant="body1">Sponsor: {projectDetails.sponsor}</Typography>
      <Typography variant="body1">
        GitHub:{' '}
        <Link
          href={projectDetails.pj_github_url}
          rel="noopener"
          target="_blank"
        >
          {projectDetails.pj_github_url}
        </Link>
      </Typography>
      <Typography sx={{ fontStyle: 'italic' }} variant="body">
        {projectDetails.intro}
      </Typography>
    </>
  );
}
