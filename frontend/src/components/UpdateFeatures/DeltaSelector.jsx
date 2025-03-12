import AddIcon from '@mui/icons-material/Add';
import { IconButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useState } from 'react';

function DeltaSelector({ monthState, deltaState }) {
  const [startMonth, endMonth] = monthState;
  const [deltas, setDeltas] = deltaState;
  const DEFAULT_DELTA_SELECTION = {
    start: '',
    end: '',
  };
  const [selectedDelta, setSelectedDelta] = useState(DEFAULT_DELTA_SELECTION);
  const selectedMonths = deltas.changedMonths;

  const handleStartChange = (event) => {
    setSelectedDelta(() => ({
      start: event.target.value,
      end: event.target.value,
    }));
  };
  const handleEndChange = (event) => {
    setSelectedDelta((prev) => ({
      ...prev,
      end: event.target.value,
    }));
  };

  const startRange = Array.from(
    Array(endMonth - startMonth),
    (_, x) => x + startMonth,
  ).filter((m) => !selectedMonths.has(m));

  const getEndRange = () => {
    const startOrLater = startRange.filter((m) => m >= selectedDelta.start);
    let result = [startOrLater[0]]; // Start with the first element

    for (let i = 1; i < startOrLater.length; i++) {
      if (startOrLater[i] - startOrLater[i - 1] > 1) {
        break;
      }
      result.push(startOrLater[i]);
    }
    return result;
  };

  const startDropdownItems = startRange.map((m) => (
    <MenuItem key={m} value={m}>
      {m.toString()}
    </MenuItem>
  ));
  const endDropdownItems = getEndRange().map((m) => (
    <MenuItem key={m} value={m}>
      {m.toString()}
    </MenuItem>
  ));

  const handleAddDelta = () => {
    setSelectedDelta(DEFAULT_DELTA_SELECTION);
    setDeltas((prev) => {
      for (let i = selectedDelta.start; i <= selectedDelta.end; i++) {
        prev.changedMonths.add(i);
      }
      const key = `${selectedDelta.start}_${selectedDelta.end}`;
      return {
        deltas: [
          ...prev.deltas,
          {
            key: key,
            startMonth: selectedDelta.start,
            endMonth: selectedDelta.end,
          },
        ],
        changedMonths: new Set(prev.changedMonths),
        selectedDelta: key,
        selectedFeature: {},
      };
    });
  };

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
      <Typography sx={{ display: 'inline' }}>Add new delta: </Typography>
      <FormControl size="small">
        <InputLabel id="start-label">Start</InputLabel>
        <Select
          label="Start"
          labelId="start-label"
          sx={{ width: '80px' }}
          value={selectedDelta.start}
          onChange={handleStartChange}
        >
          {startDropdownItems}
        </Select>
      </FormControl>
      <Divider flexItem orientation="vertical" variant="middle" />
      <FormControl size="small">
        <InputLabel id="end-label">End</InputLabel>
        <Select
          autoWidth
          disabled={selectedDelta.start === ''}
          label="End"
          sx={{ width: '80px' }}
          value={selectedDelta.end}
          onChange={handleEndChange}
        >
          {endDropdownItems}
        </Select>
      </FormControl>
      <IconButton disabled={selectedDelta.end === ''} onClick={handleAddDelta}>
        <AddIcon />
      </IconButton>
    </Box>
  );
}

export default DeltaSelector;
