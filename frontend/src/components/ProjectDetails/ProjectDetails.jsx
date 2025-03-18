import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    fontSize: 14,
  },
}));

export default function ProjectDetails() {
  const simContext = useSimulation();
  const projectDetails = simContext.selectedProjectData.details;

  const startDate = new Date(projectDetails.start_date);
  const endDate = new Date(projectDetails.end_date);
  const dateFormat = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const activeDates = simContext.selectedProjectData.id
    ? `${startDate.toLocaleDateString(undefined, dateFormat)} - ${endDate.toLocaleDateString(undefined, dateFormat)}`
    : '';

  return (
    <>
      <Stack direction="row" gap={1} sx={{ alignItems: 'center' }}>
        <Typography variant="h6">
          {simContext.selectedProjectData.id === null
            ? 'Select a project to see details.'
            : projectDetails.project_name}
        </Typography>
        {simContext.selectedProjectData.id && (
          <StyledTooltip arrow title={projectDetails.intro}>
            <InfoIcon
              fontSize="small"
              sx={{ alignmentBaseline: 'after-edge', color: 'grey' }}
            />
          </StyledTooltip>
        )}
      </Stack>
      <Typography variant="body1">Active: {activeDates}</Typography>
      <Typography variant="body1">
        Status:{' '}
        {simContext.selectedProjectData.id
          ? projectDetails.status === 1
            ? 'Graduated'
            : 'Retired'
          : ''}
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
    </>
  );
}
