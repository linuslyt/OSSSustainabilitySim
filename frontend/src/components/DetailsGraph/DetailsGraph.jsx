import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';

function DetailsGraph() {
  return (
    <Grid container spacing={6}>
      {/* Left Column - Details Section */}

      {/* Right Column - Graph */}
      <Grid size={12}>
        <Box sx={{ p: 2, bgcolor: 'lightblue' }}>
          <Typography sx={{ display: 'block' }} variant="body1">
            Graph Display
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default DetailsGraph;
