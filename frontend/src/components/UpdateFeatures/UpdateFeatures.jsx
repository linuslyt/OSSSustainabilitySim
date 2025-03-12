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
        }}
      >
        <Typography variant="h6">Update features</Typography>
        <DeltaSelector />
      </Box>
      <Box
        sx={{
          gridRow: 2,
          // backgroundColor: 'red',
        }}
      >
        <Typography sx={{ fontStyle: 'italic' }} variant="subtitle">
          Instructions for operating.
          <br />
          Selected feature: {simContext.selectedFeature.feature}
          <br />
          Selected feature month: {simContext.selectedFeature.month}
        </Typography>
      </Box>
      <Box
        sx={{ gridRow: 3, display: 'flex', alignItems: 'center', my: '0.5rem' }}
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
          gridRow: 4,
        }}
      >
        <FeatureEditor />
      </Box>
    </Box>
  );
}

export default UpdateFeatures;
