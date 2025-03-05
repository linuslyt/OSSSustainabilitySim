import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React, { useState } from 'react';

function UpdateFeatures() {
  const [features] = useState([
    { name: 'Commits', value: 100 },
    { name: 'Files Changed', value: 200 },
    { name: '% Commits made by top 10% Contributors', value: 80 },
    { name: 'Active Developers', value: 5 },
    { name: 'Emails Sent', value: 50 },
  ]);

  const [simulatedValues, setSimulatedValues] = useState(
    features.map((feature) => feature.value),
  );

  const [percentageChanges, setPercentageChanges] = useState(
    features.map(() => 0),
  );

  const updateSimulatedValue = (index, newPercentage) => {
    const percentageFactor = 1 + newPercentage / 100;
    const newSimulatedValues = [...simulatedValues];
    newSimulatedValues[index] = features[index].value * percentageFactor;
    setSimulatedValues(newSimulatedValues);
  };

  const incrementPercentage = (index) => {
    const newPercentageChanges = [...percentageChanges];
    newPercentageChanges[index] += 5;
    setPercentageChanges(newPercentageChanges);
    updateSimulatedValue(index, newPercentageChanges[index]);
  };

  const decrementPercentage = (index) => {
    const newPercentageChanges = [...percentageChanges];
    newPercentageChanges[index] -= 5;
    setPercentageChanges(newPercentageChanges);
    updateSimulatedValue(index, newPercentageChanges[index]);
  };

  return (
    <>
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body1"
              sx={{ display: 'block', fontWeight: 'bold', fontSize: '1.5rem' }}
            >
              Update Features
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2 }}>
            <Button>Simulate Changes</Button>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={0}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body1"
              sx={{
                display: 'block',
                fontWeight: 'bold',
                textDecoration: 'underline',
              }}
            >
              Feature
            </Typography>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    padding: 0,
                    minHeight: '70px', // Set minimum height for feature name
                    marginBottom: 0, // Remove margin between items
                  }}
                >
                  {feature.name}:
                </li>
              ))}
            </ul>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body1"
              sx={{
                display: 'block',
                fontWeight: 'bold',
                textDecoration: 'underline',
              }}
            >
              Original Value
            </Typography>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  minHeight: '70px', // Set minimum height for original value
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ display: 'inline-block', mr: 2 }}
                >
                  {feature.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body1"
              sx={{
                display: 'block',
                fontWeight: 'bold',
                textDecoration: 'underline',
              }}
            >
              Value to Simulate
            </Typography>
            {simulatedValues.map((simValue, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  minHeight: '70px', // Set minimum height for simulated value row
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    mr: 2,
                    padding: '2px',
                  }}
                >
                  <Button
                    sx={{
                      padding: '2px',
                      minWidth: '24px',
                      height: '20px',
                      color: 'black',
                      border: '1px solid black',
                    }}
                    onClick={() => incrementPercentage(index)}
                  >
                    +
                  </Button>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      width: '50px',
                      textAlign: 'center',
                      mr: '5px',
                      ml: '5px',
                    }}
                  >
                    {percentageChanges[index]}%
                  </Typography>
                  <Button
                    sx={{
                      padding: '2px',
                      minWidth: '24px',
                      height: '20px',
                      color: 'black',
                      border: '1px solid black',
                    }}
                    onClick={() => decrementPercentage(index)}
                  >
                    -
                  </Button>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ display: 'inline-block', mr: 2 }}
                >
                  {simValue % 1 === 0
                    ? simValue.toFixed(0)
                    : simValue.toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default UpdateFeatures;
