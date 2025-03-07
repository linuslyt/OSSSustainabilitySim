import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import './index.css';

const Input = styled(MuiInput)`
  width: 42px;
`;

function DashboardToggle({ dashboardViewState }) {
  // TODO: make selected colors more contrasty
  const [dashboardView, setDashboardView] = dashboardViewState;
  return (
    <div className="dashboard-mode-toggle">
      <ToggleButtonGroup
        color="primary"
        value={dashboardView}
        exclusive
        onChange={(event, newValue) => setDashboardView(newValue)}
        aria-label="Dashboard View"
      >
        <ToggleButton
          className="toggle-button"
          value="explore"
          aria-label="explore"
        >
          Explore
        </ToggleButton>
        <ToggleButton
          className="toggle-button"
          value="simulate"
          aria-label="simulate"
        >
          Simulate
        </ToggleButton>
      </ToggleButtonGroup>
      <p>Dashboard mode: {dashboardView}</p>
    </div>
  );
}

function MonthRangeSlider({ nMonthsState }) {
  const MIN_MONTHS = 8;
  const MAX_MONTHS = 29;
  const [nMonths, setNMonths] = nMonthsState;
  const [sliderValue, setSliderValue] = useState(MIN_MONTHS);

  const handleSetNMonths = useCallback(
    debounce((event, newValue) => setNMonths(newValue), 1000), // On window resize, call setSize with debounce of 50ms
    [],
  );

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    handleSetNMonths(event, newValue);
  };

  const handleInputChange = (event) => {
    // TODO: fix bugs w/ clamping to min/max
    setSliderValue(
      event.target.value === '' ? MIN_MONTHS : Number(event.target.value),
    );
    handleSetNMonths(event, event.target.value);
  };

  const handleBlur = () => {
    if (sliderValue < MIN_MONTHS) {
      setNMonths(MIN_MONTHS);
    } else if (sliderValue > MAX_MONTHS) {
      setNMonths(MAX_MONTHS);
    }
  };
  return (
    <div className="month-range-select">
      <Box sx={{ width: 250 }}>
        <Typography id="input-slider" gutterBottom>
          # Months
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item>
            <CalendarMonthIcon />
          </Grid>
          <Grid item xs>
            <Slider
              value={typeof sliderValue === 'number' ? sliderValue : 0}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              min={MIN_MONTHS}
              max={MAX_MONTHS}
            />
          </Grid>
          <Grid item>
            <Input
              value={sliderValue}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{
                step: 1,
                min: MIN_MONTHS,
                max: MAX_MONTHS,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Grid>
        </Grid>
        <Typography id="input-slider" gutterBottom>
          # Months selected = {nMonths}
        </Typography>
      </Box>
    </div>
  );
}

export default function Controls({
  // dashboardViewState,
  nMonthsState,
}) {
  return (
    <div className="controls-container">
      {/* <DashboardToggle dashboardViewState={dashboardViewState} /> */}
      <MonthRangeSlider nMonthsState={nMonthsState} />
    </div>
  );
}

MonthRangeSlider.propTypes = {
  nMonthsState: PropTypes.array.isRequired,
};

DashboardToggle.propTypes = {
  dashboardViewState: PropTypes.array.isRequired,
};

Controls.propTypes = {
  // dashboardViewState: PropTypes.array.isRequired,
  nMonthsState: PropTypes.array.isRequired,
};
