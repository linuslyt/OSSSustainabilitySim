import AddIcon from '@mui/icons-material/Add';
import { IconButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip disableInteractive {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    fontSize: 13,
  },
}));

function DeltaSelector() {
  // Local state
  const EMPTY_PERIOD = {
    startMonth: '',
    endMonth: '',
  };
  const [selectorState, setSelectorState] = useState(EMPTY_PERIOD);
  const handleStartChange = (event) => {
    setSelectorState(() => ({
      startMonth: event.target.value,
      endMonth: event.target.value,
    }));
  };
  const handleEndChange = (event) => {
    setSelectorState((prev) => ({
      ...prev,
      endMonth: event.target.value,
    }));
  };

  // Context state
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();
  const selectedMonths = simContext.simulationData.changedMonths;

  const handleAddDelta = () => {
    simDispatch({ type: 'add_new_period', period: selectorState });
    setSelectorState(EMPTY_PERIOD);
  };

  // Generate valid month options
  const nMonths = simContext.selectedProjectData.features.length;
  const startMonths = Array.from(Array(nMonths), (_, x) => x + 1).filter(
    (m) => !selectedMonths.has(m),
  );
  const getEndMonthsForStartMonth = () => {
    if (isEmpty(startMonths)) return [];
    const startOrLater = startMonths.filter(
      (m) => m >= selectorState.startMonth,
    );
    let result = [startOrLater[0]]; // Start with the first element

    for (let i = 1; i < startOrLater.length; i++) {
      if (startOrLater[i] - startOrLater[i - 1] > 1) {
        break;
      }
      result.push(startOrLater[i]);
    }
    return result;
  };

  const startDropdownItems = startMonths.map((m) => (
    <MenuItem key={m} value={m}>
      {m.toString()}
    </MenuItem>
  ));
  const endDropdownItems = getEndMonthsForStartMonth().map((m) => (
    <MenuItem key={m} value={m}>
      {m.toString()}
    </MenuItem>
  ));

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        direction: 'column',
        alignItems: 'center',
        width: 'fit-content',
        overflow: 'wrap',
        gap: 1,
      }}
    >
      <Typography sx={{ display: 'inline', fontWeight: 500, mr: 1 }}>
        Add change period:{' '}
      </Typography>
      <FormControl disabled={isEmpty(startMonths)} size="small">
        <InputLabel id="start-label">Start</InputLabel>
        <StyledTooltip
          title={
            !simContext.selectedProject?.project_id
              ? 'No project selected'
              : isEmpty(startMonths)
                ? 'No more months to simulate.'
                : ''
          }
        >
          <Select
            label="Start"
            labelId="start-label"
            sx={{ width: '80px', borderRadius: 3 }}
            value={selectorState.startMonth}
            onChange={handleStartChange}
          >
            {startDropdownItems}
          </Select>
        </StyledTooltip>
      </FormControl>
      <Divider flexItem orientation="vertical" variant="middle" />
      <FormControl disabled={selectorState.startMonth === ''} size="small">
        <InputLabel id="end-label">End</InputLabel>
        <StyledTooltip
          title={
            !simContext.selectedProject?.project_id
              ? 'No project selected.'
              : isEmpty(startMonths)
                ? 'No more months to simulate.'
                : selectorState.startMonth === ''
                  ? 'Select a start month first.'
                  : ''
          }
        >
          <Select
            autoWidth
            label="End"
            sx={{ width: '80px', borderRadius: 3 }}
            value={selectorState.endMonth}
            onChange={handleEndChange}
          >
            {endDropdownItems}
          </Select>
        </StyledTooltip>
      </FormControl>
      <IconButton
        disabled={selectorState.endMonth === ''}
        onClick={handleAddDelta}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
}

export default DeltaSelector;
