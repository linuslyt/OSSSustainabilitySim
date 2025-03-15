import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import React from 'react';
import { SimulationContextProvider } from './components/context/SimulationContextProvider';
import FeatureGraph from './components/FeatureGraph/FeatureGraph';
import ForecastGraph from './components/ForecastGraph/ForecastGraph';
import Header from './components/Header/Header';
import ProjectDetails from './components/ProjectDetails/ProjectDetails';
import UpdateFeatures from './components/UpdateFeatures/UpdateFeatures';

function App() {
  const Panel = styled(Box)(({ theme }) => ({
    backgroundColor: 'linen',
    height: '100%',
    color: 'black',
    boxSizing: 'border-box', // so added padding doesn't overflow
    padding: theme.spacing(2),
    overflowY: 'auto',
    borderRadius: '9px',
  }));

  return (
    <SimulationContextProvider>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          backgroundColor: 'whitesmoke',
          display: 'grid',
          gridTemplateRows: 'min-content max(240px, 30%) auto',
          overflow: 'hidden',
        }}
      >
        <Header
          sx={{
            backgroundColor: 'lightgrey',
            color: 'black',
            gridRow: 1,
          }}
        />
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
            height: '100%',
          }}
        >
          <Grid container spacing={2} sx={{ padding: 2, height: '100%' }}>
            <Grid size={8}>
              <Panel>
                <UpdateFeatures />
              </Panel>
            </Grid>
            <Grid size={4}>
              <Box
                sx={{
                  height: '100%',
                  display: 'grid',
                  gridTemplateRows: 'min-content auto',
                  overflow: 'hidden',
                  gap: 2,
                }}
              >
                <Panel
                  sx={{
                    gridRow: 1,
                    mx: 0.5,
                  }}
                >
                  <ProjectDetails />
                </Panel>
                <Panel
                  sx={{
                    gridRow: 2,
                    mx: 0.5,
                  }}
                >
                  <FeatureGraph />
                </Panel>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </SimulationContextProvider>
  );
}

export default App;
