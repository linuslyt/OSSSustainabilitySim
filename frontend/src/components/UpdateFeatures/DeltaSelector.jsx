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
    <MenuItem value={m} key={m}>
      {m.toString()}
    </MenuItem>
  ));
  const endDropdownItems = getEndRange().map((m) => (
    <MenuItem value={m} key={m}>
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
          labelId="start-label"
          value={selectedDelta.start}
          label="Start"
          onChange={handleStartChange}
          sx={{ width: '80px' }}
        >
          {startDropdownItems}
        </Select>
      </FormControl>
      <Divider orientation="vertical" variant="middle" flexItem />
      <FormControl size="small">
        <InputLabel id="end-label">End</InputLabel>
        <Select
          value={selectedDelta.end}
          label="End"
          onChange={handleEndChange}
          autoWidth
          sx={{ width: '80px' }}
          disabled={selectedDelta.start === ''}
        >
          {endDropdownItems}
        </Select>
      </FormControl>
      <IconButton onClick={handleAddDelta} disabled={selectedDelta.end === ''}>
        <AddIcon />
      </IconButton>
    </Box>
  );
}

export default DeltaSelector;
