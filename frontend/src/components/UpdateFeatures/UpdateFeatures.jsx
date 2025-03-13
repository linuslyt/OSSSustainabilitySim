import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import DeltaList from './DeltaList';
import DeltaSelector from './DeltaSelector';
import FeatureEditor from './FeatureEditor';
function UpdateFeatures() {
  const simContext = useSimulation();

  return (
    <Box
      sx={{
        height: '100%',
        // backgroundColor: 'whitesmoke',
        display: 'grid',
        gridTemplateRows: 'min-content min-content min-content auto',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          gridRow: 1,
          // backgroundColor: 'blue',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          mx: 0.5,
        }}
      >
        <Typography variant="h6">Update features</Typography>
        <DeltaSelector />
      </Box>
      <Box
        sx={{
          gridRow: 2,
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
          mx: 0.5,
        }}
      >
        <Typography
          sx={{
            marginRight: '0.5rem',
            alignSelf: 'start',
            marginTop: '0.2rem',
          }}
        >
          Change periods:
        </Typography>
        <DeltaList />
      </Box>
      <Box
        sx={{
          gridRow: 3,
          mt: 1,
          mb: 0.5,
          mx: 0.5,
        }}
      >
        <Typography sx={{ fontStyle: '' }} variant="subtitle">
          Double click on a cell in either{' '}
          <Typography
            sx={{ fontStyle: 'normal', fontWeight: 600 }}
            variant="subtitle"
          >
            &#39;Simulated value&#39;
          </Typography>{' '}
          or{' '}
          <Typography
            sx={{ fontStyle: 'normal', fontWeight: 600 }}
            variant="subtitle"
          >
            &#39;% change simulated&#39;
          </Typography>{' '}
          to edit. <br />
          Note that{' '}
          <Typography
            sx={{ fontStyle: 'normal', fontWeight: 600 }}
            variant="subtitle"
          >
            &#39;% change simulated&#39;
          </Typography>{' '}
          is rounded to the nearest percentage that changes the rounded
          simulated value.
        </Typography>
      </Box>
      <Box
        sx={{
          gridRow: 4,
        }}
      >
        <FeatureEditor />
      </Box>
    </Box>
  );
}

export default UpdateFeatures;
