import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import React from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';

function DeltaList() {
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();

  const monthChips = simContext.simulationData.changedPeriods
    .sort((a, b) => {
      if (a.startMonth < b.startMonth) return -1;
      if (a.startMonth > b.startMonth) return 1;
      return 0;
    })
    .map((d) => {
      const mLabel =
        d.startMonth !== d.endMonth
          ? `Months ${d.startMonth}-${d.endMonth}`
          : `Month ${d.startMonth}`;

      return (
        <Chip
          key={d.key}
          label={mLabel}
          color={
            d.key === simContext.simulationData.selectedPeriod.key
              ? 'primary'
              : ''
          }
          onClick={() =>
            simDispatch({
              type: 'set_selected_period',
              period: {
                key: d.key,
                startMonth: d.startMonth,
                endMonth: d.endMonth,
              },
            })
          }
          onDelete={() =>
            simDispatch({
              type: 'delete_selected_period',
              period: {
                key: d.key,
                startMonth: d.startMonth,
                endMonth: d.endMonth,
              },
            })
          }
        />
      );
    });

  return (
    <Stack useFlexGap direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
      {monthChips}
    </Stack>
  );
}
export default DeltaList;
