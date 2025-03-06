import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';
import DeltaList from './DeltaList';

function UpdateFeatures() {
  const [features] = useState([
    { name: 'Commits', value: 100 },
    { name: 'Files Changed', value: 200 },
    { name: '% Commits made by top 10% Contributors', value: 80 },
    { name: 'Active Developers', value: 5 },
    { name: 'Emails Sent', value: 50 },
  ]);

  const [deltas, setDeltas] = React.useState({
    deltas: [
      { key: '1_1', startMonth: 1, endMonth: 1 },
      { key: '2_2', startMonth: 2, endMonth: 2 },
      { key: '3_4', startMonth: 3, endMonth: 4 },
    ],
    changedMonths: new Set(),
    selectedDelta: '1_1',
  });

  const [simulatedValues, setSimulatedValues] = useState(
    features.map((feature) => feature.value),
  );

  const [percentageChanges, setPercentageChanges] = useState(
    features.map(() => 0),
  );

  const updateSimulatedValue = (index, newPercentage) => {
    const percentageFactor = 1 + newPercentage / 100;
    const newSimulatedValues = [...simulatedValues];
    newSimulatedValues[index] = features[index].value * percentageFactor;
    setSimulatedValues(newSimulatedValues);
  };

  const incrementPercentage = (index) => {
    const newPercentageChanges = [...percentageChanges];
    newPercentageChanges[index] += 5;
    setPercentageChanges(newPercentageChanges);
    updateSimulatedValue(index, newPercentageChanges[index]);
  };

  const decrementPercentage = (index) => {
    const newPercentageChanges = [...percentageChanges];
    newPercentageChanges[index] -= 5;
    setPercentageChanges(newPercentageChanges);
    updateSimulatedValue(index, newPercentageChanges[index]);
  };

  return (
    <Box
      sx={{
        height: '100%',
        backgroundColor: 'whitesmoke',
        display: 'grid',
        gridTemplateRows: 'min-content min-content min-content auto',
      }}
    >
      <Box
        sx={{
          gridRow: 1,
          backgroundColor: 'blue',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">Update features</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'pink',
          }}
        >
          <Typography sx={{ marginRight: '0.5rem' }}>
            Add new delta for
          </Typography>
          <Typography sx={{ marginRight: '0.5rem' }}>
            Month select component
          </Typography>
          <Typography>+</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          gridRow: 2,
          backgroundColor: 'red',
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
          backgroundColor: 'yellow',
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
