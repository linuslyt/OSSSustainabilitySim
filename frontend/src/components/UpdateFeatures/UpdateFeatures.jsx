import PublishIcon from '@mui/icons-material/Publish';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import DeltaList from './DeltaList';
import DeltaSelector from './DeltaSelector';
import FeatureEditor from './FeatureEditor';

function UpdateFeatures() {
  const simContext = useSimulation();
  const [submitting, setSubmitting] = useState(false);
  return (
    <Box
      sx={{
        height: '100%',
        // backgroundColor: 'whitesmoke',
        display: 'grid',
        gridTemplateRows: 'min-content min-content auto',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          gridRow: 1,
          display: 'grid',
          gridTemplateColumns: 'max-content auto min-content',
          my: 0.75,
          mb: 1,
          mx: 0.5,
          gap: 2,
        }}
      >
        <Box sx={{ gridColumn: 1, mr: 1 }}>
          <DeltaSelector />
        </Box>
        <Box
          sx={{
            gridColumn: 2,
            overflow: 'auto',
            alignSelf: 'center',
            mr: 1,
          }}
        >
          <DeltaList />
        </Box>
        <Box sx={{ gridColumn: 3 }}>
          <Button
            disableElevation
            disabled={isEmpty(simContext.simulationData?.changes)}
            endIcon={<PublishIcon />}
            loading={submitting}
            loadingPosition="end"
            size="large"
            variant="contained"
            sx={{
              fontFamily: 'inherit',
              fontWeight: 400,
              px: 2,
              borderRadius: 3,
            }}
            onClick={() => setSubmitting(true)}
          >
            Simulate
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          gridRow: 2,
          mb: 1,
          mx: 0.5,
        }}
      >
        <Typography variant="subtitle">
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
          is rounded to the nearest percentage that changes the (rounded)
          simulated value.
        </Typography>
      </Box>
      <Box
        sx={{
          gridRow: 3,
        }}
      >
        <FeatureEditor />
      </Box>
    </Box>
  );
}

export default UpdateFeatures;
