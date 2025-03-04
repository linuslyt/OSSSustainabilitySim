import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

import React, { useState } from 'react';

import ForecastGraph from './components/ForecastGraph/ForecastGraph';
import Header from './components/Header/Header';

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
  }));

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'whitesmoke',
        display: 'grid',
        gridTemplateRows: 'minmax(60px, 7%) 43% auto',
        // overflow: 'hidden',
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
        }}
      >
        <Grid container sx={{ height: '100%', padding: 2 }} spacing={2}>
          <Grid size={6}>
            <Panel>
              <Typography variant="body1" sx={{ display: 'block' }}>
                Import and insert your component here. Style with inline styling
                (sx prop) or styled components (see Panel as example). Use MUI
                Typography for text boxes, Box for divs.
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
            </Panel>
          </Grid>
          <Grid size={6}>
            <Panel>
              Import and insert your component here. Style with inline styling
              (sx prop) styled components (see Panel as example). Use MUI
              Typography for text boxes, Box for divs.
              <br />
              <br />
              Use a Grid/stack to split into two columns, left for details and
              right for graph.
            </Panel>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App;
