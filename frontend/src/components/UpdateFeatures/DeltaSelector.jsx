import AddIcon from '@mui/icons-material/Add';
import { IconButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';

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
  // TODO: memoize these
  const nMonths = 12; // TODO: get from project feature/pred history from context
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
        my: '0.5rem',
        backgroundColor: '31',
        width: 'max-content',
        overflow: 'wrap',
        gap: 1,
      }}
    >
      {/* TODO: fix wrapping on narrow box */}
      <Typography sx={{ display: 'inline' }}>
        Add new change period:{' '}
      </Typography>
      <FormControl disabled={isEmpty(startMonths)} size="small">
        <InputLabel id="start-label">Start</InputLabel>
        <Tooltip
          title={isEmpty(startMonths) ? 'No more months to simulate.' : ''}
        >
          <Select
            label="Start"
            labelId="start-label"
            sx={{ width: '80px' }}
            value={selectorState.startMonth}
            onChange={handleStartChange}
          >
            {startDropdownItems}
          </Select>
        </Tooltip>
      </FormControl>
      <Divider flexItem orientation="vertical" variant="middle" />
      <FormControl disabled={selectorState.startMonth === ''} size="small">
        <InputLabel id="end-label">End</InputLabel>
        <Tooltip
          title={
            isEmpty(startMonths)
              ? 'No more months to simulate.'
              : selectorState.startMonth === ''
                ? 'Select a start month first.'
                : ''
          }
        >
          <Select
            autoWidth
            label="End"
            sx={{ width: '80px' }}
            value={selectorState.endMonth}
            onChange={handleEndChange}
          >
            {endDropdownItems}
          </Select>
        </Tooltip>
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
