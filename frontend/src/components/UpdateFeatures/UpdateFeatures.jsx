import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import DeltaList from './DeltaList';
import DeltaSelector from './DeltaSelector';
import FeatureEditor from './FeatureEditor';

// https://mui.com/x/react-data-grid/editing/?srsltid=AfmBOoqwLp0UUX_K4K0L5lh_AQBgc2qH_UDg9_hFe9ezEckR05cQJP21#value-parser-and-value-setter
// valueParser and valueSetter
// editable column for simulated
// editable column for % change

// https://mui.com/x/react-data-grid/editing/?srsltid=AfmBOoqwLp0UUX_K4K0L5lh_AQBgc2qH_UDg9_hFe9ezEckR05cQJP21#validation
// validate cell
// depending on feature type
// create validation methods
// map feature -> [validationMethods]
// call getValidationsForFeature(feature).all()
// valueParser performs preprocessing (probably not needed)
// validate checks whether the change is in range/possible

// TODO: put monthly average into column as well?
function UpdateFeatures() {
  const [deltas, setDeltas] = React.useState({
    deltas: [
      // Uncomment for default demo
      { key: '1_1', startMonth: 1, endMonth: 1 },
      { key: '2_2', startMonth: 2, endMonth: 2 },
      { key: '3_4', startMonth: 3, endMonth: 4 },
    ],
    // changedMonths: new Set(),
    changedMonths: new Set([1, 2, 3, 4]), // TODO: remove this. only used in selector. but make sure selector rerenders when deltas updates.
    selectedDelta: '1_1',
    selectedFeature: {},
  });

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
        <DeltaSelector monthState={[1, 13]} deltaState={[deltas, setDeltas]} />
      </Box>
      <Box
        sx={{
          gridRow: 2,
          // backgroundColor: 'red',
        }}
      >
        <Typography variant="subtitle" sx={{ fontStyle: 'italic' }}>
          Instructions for operating.
          <br />
          Selected feature: {deltas.selectedFeature.feature}
          <br />
          Selected feature month: {deltas.selectedFeature.month}
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
      <Box
        sx={{
          gridRow: 4,
        }}
      >
        {deltas.selectedDelta ? (
          <FeatureEditor deltasState={[deltas, setDeltas]} />
        ) : (
          <Typography>
            'No deltas defined. Create a delta using the month picker above.'
          </Typography>
        )}
        {/* TODO: datagrid component. input state: selected month range. output state: selected  */}
      </Box>
    </Box>
  );
}

export default UpdateFeatures;
