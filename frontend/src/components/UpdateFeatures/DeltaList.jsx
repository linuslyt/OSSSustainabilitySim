import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types';
import React from 'react';

function DeltaList({ deltasState }) {
  const [deltas, setDeltas] = deltasState;

  const handleSelect = (d) => {
    setDeltas((prev) => {
      return {
        ...prev,
        selectedDelta: d.key,
      };
    });
  };

  const handleDelete = (d) => {
    setDeltas((prev) => {
      const newDeltas = prev.deltas.filter(
        (prevDelta) => prevDelta.startMonth !== d.startMonth,
      );

      for (let i = d.startMonth; i <= d.endMonth; i++) {
        prev.changedMonths.delete(i);
      }

      const selectedDelta =
        prev.selectedDelta === d.key
          ? newDeltas.length > 0
            ? newDeltas[0].key
            : null
          : prev.selectedDelta;

      return {
        deltas: newDeltas,
        changedMonths: new Set(prev.changedMonths),
        selectedDelta: selectedDelta,
      };
    });
  };

  const monthChips = deltas.deltas.map((d) => {
    const mLabel =
      d.startMonth !== d.endMonth
        ? `Months ${d.startMonth}-${d.endMonth}`
        : `Month ${d.startMonth}`;

    return (
      <Chip
        key={d.key}
        label={mLabel}
        onClick={() => handleSelect(d)}
        onDelete={() => handleDelete(d)}
      />
    );
  });

  return (
    <Stack spacing={0.5} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
      {monthChips}
    </Stack>
  );
}

DeltaList.propTypes = {
  deltasState: PropTypes.array.isRequired,
};

export default DeltaList;
