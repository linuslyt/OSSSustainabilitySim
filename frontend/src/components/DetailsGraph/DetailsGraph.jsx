import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';

function DetailsGraph() {
  return (
    <Grid container spacing={6}>
      {/* Left Column - Details Section */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ p: 2, bgcolor: 'lightblue' }}>
          <Typography variant="body1" sx={{ display: 'block' }}>
            More Details
          </Typography>
        </Box>
      </Grid>

      {/* Right Column - Graph */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ p: 2, bgcolor: 'lightblue' }}>
          <Typography variant="body1" sx={{ display: 'block' }}>
            Graph Display
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default DetailsGraph;
