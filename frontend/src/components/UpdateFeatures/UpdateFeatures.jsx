import TimelineIcon from '@mui/icons-material/Timeline';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';
import { SIMULATE_WITH_DELTAS } from '../endpoints';
import DeltaList from './DeltaList';
import DeltaSelector from './DeltaSelector';
import FeatureEditor from './FeatureEditor';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    fontSize: 13,
  },
}));

const SAMPLE_DELTAS = {
  project_id: '200',
  deltas: [
    {
      months: [1, 3],
      feature_changes: [
        {
          feature_name: 'num_commits',
          change_type: 'percentage',
          change_value: 20,
        },
        {
          feature_name: 'num_files',
          change_type: 'explicit',
          change_values: [100, 150],
        },
      ],
    },
    {
      months: [6, 7],
      feature_changes: [
        {
          feature_name: 'num_commits',
          change_type: 'explicit',
          change_value: 2,
        },
        {
          feature_name: 'num_files',
          change_type: 'explicit',
          change_values: [13, 5],
        },
      ],
    },
  ],
};

function UpdateFeatures() {
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();
  const [submitting, setSubmitting] = useState(false);

  const handleSimulateChanges = async () => {
    const deltas = [...simContext.simulationData.changes.values()].map((v) => ({
      months: [v.month],
      feature_changes: [
        {
          feature_name: v.feature,
          change_type: 'explicit',
          change_value: v.new_value,
        },
      ],
    }));
    try {
      setSubmitting(true);
      const simResponse = await fetch(SIMULATE_WITH_DELTAS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: simContext.selectedProject.project_id,
          deltas: deltas,
        }),
      });

      const simResults = await simResponse.json();
      simDispatch({
        type: 'set_simulation_results',
        data: simResults.predictions,
      });
      setSubmitting(false);
    } catch (e) {
      console.log(`Error simulating changes=${deltas}.`);
      console.log(e);
      setSubmitting(false);
    }
  };

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
          <StyledTooltip
            arrow
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8],
                    },
                  },
                ],
              },
            }}
            title={
              isEmpty(simContext.simulationData?.changes)
                ? 'No changes to simulate.'
                : ''
            }
          >
            <span>
              <Button
                disableElevation
                disabled={isEmpty(simContext.simulationData?.changes)}
                endIcon={<TimelineIcon />}
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
                onClick={() => handleSimulateChanges()}
              >
                Simulate
              </Button>
            </span>
          </StyledTooltip>
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
