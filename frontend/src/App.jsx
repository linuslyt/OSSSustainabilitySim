import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

import React, { useState } from 'react';

import DetailsGraph from './components/DetailsGraph/DetailsGraph';
import ForecastGraph from './components/ForecastGraph/ForecastGraph';
import Header from './components/Header/Header';
import UpdateFeatures from './components/UpdateFeatures/UpdateFeatures';

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  // const [dashboardView, setDashboardView] = useState('explore');
  // const [nMonths, setNMonths] = useState('8');

  const Panel = styled(Box)(({ theme }) => ({
    backgroundColor: 'linen',
    height: '100%',
    color: 'black',
    boxSizing: 'border-box', // so added padding doesn't overflow
    padding: theme.spacing(2),
    overflowY: 'auto',
  }));

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'whitesmoke',
        display: 'grid',
        gridTemplateRows: 'minmax(60px, 7%) 43% auto',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'lightgrey',
          color: 'black',
          gridRow: 1,
        }}
      >
        <Header projectState={[selectedProject, setSelectedProject]} />
      </Box>
      <Box
        sx={{
          color: 'black',
          gridRow: 2,
          overflow: 'hidden',
        }}
      >
        <ForecastGraph />
      </Box>
      <Box
        sx={{
          gridRow: 3,
          padding: 0,
          margin: 0,
          overflowY: 'auto',
        }}
      >
        <Grid container sx={{ padding: 2 }} spacing={2}>
          <Grid size={6}>
            <Panel>
              <Typography variant="body1" sx={{ display: 'block' }}>
                <br />
                <br />
                Selected project (select w/ dropdown to view here):
                <br />
                id: {selectedProject?.project_id}
                <br />
                name: {selectedProject?.project_name}
                <br />
                status: {selectedProject?.status}
              </Typography>
              <UpdateFeatures />
            </Panel>
          </Grid>
          <Grid size={6}>
            <Panel>
              <br />
              <br />
              <DetailsGraph />
            </Panel>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App;
