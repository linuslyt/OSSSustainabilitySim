import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import React from 'react';
import DeltaList from './DeltaList';
import DeltaSelector from './DeltaSelector';

function UpdateFeatures() {
  const [deltas, setDeltas] = React.useState({
    deltas: [
      // Uncomment for default demo
      // { key: '1_1', startMonth: 1, endMonth: 1 },
      // { key: '2_2', startMonth: 2, endMonth: 2 },
      // { key: '3_4', startMonth: 3, endMonth: 4 },
    ],
    changedMonths: new Set(),
    // changedMonths: new Set([1, 2, 3, 4]),
    selectedDelta: '',
  });

  return (
    <Box
      sx={{
        height: '100%',
        // backgroundColor: 'whitesmoke',
        display: 'grid',
        gridTemplateRows: 'min-content min-content min-content auto',
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
        <DeltaSelector monthState={[1, 13]} deltaState={[deltas, setDeltas]} />
      </Box>
      <Box
        sx={{
          gridRow: 2,
          // backgroundColor: 'red',
        }}
      >
        <Typography variant="subtitle" sx={{ fontStyle: 'italic' }}>
          Instructions for operating
        </Typography>
      </Box>
      <Box
        sx={{ gridRow: 3, display: 'flex', alignItems: 'center', my: '0.5rem' }}
      >
        <Typography
          sx={{ marginRight: '1rem', alignSelf: 'start', marginTop: '0.2rem' }}
        >
          Deltas:
        </Typography>
        <DeltaList deltasState={[deltas, setDeltas]} />
      </Box>
      <Grid
        sx={{
          gridRow: 4,
          // backgroundColor: 'yellow',
        }}
      >
        <Typography>
          {deltas.selectedDelta
            ? deltas.selectedDelta
            : 'No deltas defined. Create a delta using the month picker above.'}
        </Typography>
        {/* TODO: datagrid component. input state: selected month range. output state: selected  */}
      </Grid>
    </Box>
  );
}

export default UpdateFeatures;
