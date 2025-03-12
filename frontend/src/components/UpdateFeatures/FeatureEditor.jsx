import HelpIcon from '@mui/icons-material/Help';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReplayIcon from '@mui/icons-material/Replay';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';
import {
  DUMMY_CHANGES,
  DUMMY_DATA,
  FEATURE_DESCRIPTIONS,
  FEATURE_ORDER,
  FEATURE_TYPES,
} from './constants';
// TODO: color for row being edited
// TODO: stripe edited rows
// TODO: documentation
// TODO: known issue - if you edit then exit editing too quick (e.g. typing new value then pressing enter right after),
//       it will fail to save, and you have to re-click and re-exit to save it properly.
/* Helpers */
function getRowId(month, feature) {
  return month + '-' + feature;
}

function getPercentChange(newVal, oldVal) {
  // 1 d.p. in % units for pChange.
  return parseFloat((((newVal - oldVal) / oldVal) * 100.0).toFixed(1));
}

function getNewValueFromPChange(feature, oldVal, pChange) {
  // 2 d.p. for new_value
  return FEATURE_TYPES.get(feature) === 'INTEGER'
    ? Math.round(oldVal * (1 + pChange / 100))
    : parseFloat((oldVal * (1 + pChange / 100)).toFixed(2));
}

export default function FeatureEditor() {
  /* State */
  // TODO: 2) convert to react context
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();

  const [deltas, setDeltas] = React.useState({
    deltas: simContext.simulationData.changedPeriods,
    // changedMonths: new Set(),
    changedMonths: new Set([1, 2, 3, 4]), // TODO: remove this. only used in selector. but make sure selector rerenders when deltas updates.
    selectedDelta: '1_1',
    selectedFeature: {},
  });
  const selectedDelta = deltas.deltas.find(
    (d) => d.key === deltas.selectedDelta,
  );
  const { _, startMonth, endMonth } = selectedDelta;

  // Changes format: Map of { string: `month-feature_name` -> object: { month: number, feature: string, new_value: number } }
  const [changes, setChanges] = useState(
    new Map(DUMMY_CHANGES.map((c) => [c.id, c.change])),
  );
  // Ref for DataGrid. Used to call DataGrid actions programmatically.
  const dataGridApiRef = useGridApiRef();

  // TODO: get data from server
  const data = DUMMY_DATA;
  const selectedData = data.filter(
    (d) => d.month >= startMonth && d.month <= endMonth,
  );

  // Data from server: array of objects. Pivot to array of monthly feature values.
  function pivot(data) {
    // Whenever a cell is updated, changes are persisted in the `changes` State by handleRowUpdate(), which triggers a rerender.
    // pivot() runs on every render and pulls new_values fresh from `changes`. Since the pChange column is later derived from new_value,
    // the simulated value and % change columns will always be synced and kept updated.
    //
    // To avoid calling pivot() during every render (cell edit), one could persist cell edits to `changes` only on changes to the
    // selected delta, feature, or project. If pivot is not called every render, the valueSetter callback defined for the pChange
    // column will then be used to keep pChange and new_value columns synced.

    // console.log('pivoting');

    return data
      .flatMap(({ month, ...rest }) =>
        Object.entries(rest).map(([feature, value]) => ({
          id: getRowId(month, feature),
          month,
          feature,
          value,
          // Simulated value
          new_value: changes.has(getRowId(month, feature))
            ? changes.get(getRowId(month, feature)).new_value
            : value,
        })),
      )
      .sort(
        (a, b) =>
          FEATURE_ORDER.indexOf(a.feature) - FEATURE_ORDER.indexOf(b.feature) ||
          a.month - b.month,
      );
  }

  const rows = pivot(selectedData);

  /* Handlers */
  // TODO: set all callbacks to useCallback()
  function handleReset(params) {
    const { id } = params;
    changes.delete(id);
    setChanges(new Map(changes));
  }

  function handleCopyToAllMonths(params) {
    console.log(params);
    const { row } = params;
    const pChange = getPercentChange(row.new_value, row.value);

    for (let i = selectedDelta.startMonth; i <= selectedDelta.endMonth; i++) {
      const id = getRowId(i, row.feature);
      console.log(pChange);

      const oldValue = rows.find(
        (r) => r.feature === row.feature && r.month === i,
      ).value;

      const newValue = getNewValueFromPChange(row.feature, oldValue, pChange);
      changes.set(id, {
        month: row.month,
        feature: row.feature,
        new_value: newValue,
      });
      setChanges(new Map(changes));
    }
  }

  function handleInspect(row) {
    setDeltas((prev) => ({
      ...prev,
      selectedFeature: {
        feature: row.feature,
        month: row.month,
      },
    }));
  }

  function handleRowUpdate(updatedRow) {
    changes.set(updatedRow.id, {
      month: updatedRow.month,
      feature: updatedRow.feature,
      new_value: updatedRow.new_value,
    });
    setChanges(new Map(changes));
    return updatedRow;
  }

  const columns = [
    {
      field: 'feature',
      headerName: 'Feature',
      flex: 1,
      renderCell: ({ value }) => {
        return (
          <Stack
            alignItems="center"
            direction="row"
            gap={1}
            sx={{ width: 'fit-content' }}
          >
            {value}
            <Tooltip title={FEATURE_DESCRIPTIONS.get(value)}>
              <HelpIcon
                fontSize="inherit"
                sx={{ alignmentBaseline: 'after-edge', color: 'grey' }}
              />
            </Tooltip>
          </Stack>
        );
      },
    },
    {
      field: 'month',
      type: 'number',
      headerName: 'Month',
      flex: 1,
      rowSpanValueGetter: () => null, // disable row spanning on equal values
    },
    {
      field: 'value',
      type: 'number',
      headerName: 'Original value',
      // headerClassName: 'border-cell',
      flex: 1,
      cellClassName: 'border-cell',
      sortable: false,
      rowSpanValueGetter: () => null,
    },
    {
      field: 'new_value',
      type: 'number',
      headerName: 'Simulated value',
      editable: 1,
      flex: 1,
      sortable: false,
      rowSpanValueGetter: () => null, // disable row spanning on equal values
      preProcessEditCellProps: (params) => {
        // Validation to disallow negative numbers.
        // Setting `error: true` prevents MUI from saving the new value. Presenting the error needs to be done manually.
        // See: https://github.com/mui/mui-x/issues/8854#issuecomment-1534730413
        // TODO: wrap renderEditCell to highlight cell as invalid
        const isValid = params.props.value >= 0.0;
        return { ...params.props, error: !isValid };
      },
    },
    {
      field: 'pChange',
      type: 'number',
      headerName: '% change simulated',
      editable: 1,
      flex: 1,
      rowSpanValueGetter: () => null, // disable row spanning on equal values
      valueGetter: (_, row) => {
        // When new_value changes, pChange will automatically update as well.
        return getPercentChange(row.new_value, row.value);
      },
      valueSetter: (pChange, row) => {
        // When editing pChange, update new_value as well.
        //
        // This currently duplicates work from pivot(), but if pivot() is not called per edit, then this function
        // is needed for consistency. See comments under pivot() above.
        return {
          ...row,
          new_value: getNewValueFromPChange(row.feature, row.value, pChange),
        };
      },
      valueFormatter: (value) => {
        // Format percentage for display.
        return value === null
          ? ''
          : `${value > 0 ? '+' : ''}${value.toLocaleString()} %`;
      },
      preProcessEditCellProps: (params) => {
        // TODO: validation per feature type.
        // Validation to disallow negative numbers.
        // Setting `error: true` prevents MUI from saving the new value. Presenting the error needs to be done manually.
        // See: https://github.com/mui/mui-x/issues/8854#issuecomment-1534730413
        // TODO: wrap renderEditCell to highlight cell as invalid
        const isValid = params.props.value >= -100.0;
        return { ...params.props, error: !isValid };
      },
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      cellClassName: 'actions',
      getActions: (params) => {
        return [
          <Tooltip key={params.id + '_reset'} title="Reset">
            <GridActionsCellItem
              className="textPrimary"
              color="inherit"
              icon={<ReplayIcon />}
              label="Reset"
              onClick={() => handleReset(params)}
            />
          </Tooltip>,
          <Tooltip
            key={params.id + '_copyToAll'}
            title="Copy % change to all months for feature"
          >
            <GridActionsCellItem
              color="inherit"
              icon={<SouthWestIcon />}
              label="CopyToAllMonthsForFeature"
              onClick={() => handleCopyToAllMonths(params)}
            />
          </Tooltip>,
          <Tooltip key={params.id + '_inspectFeature'} title="Inspect feature">
            <GridActionsCellItem
              color="inherit"
              icon={<QueryStatsIcon />}
              label="InspectFeature"
              onClick={() => handleInspect(params.row)}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  useEffect(() => {
    // Autosize columns on data update
    dataGridApiRef.current.autosizeColumns({
      columns: ['feature', 'actions'],
      includeOutliers: true,
      includeHeaders: true,
    });
  }, [dataGridApiRef, changes]);

  return (
    // Double Box is a weird hack to prevent DataGrid from overflowing height.
    // See: https://stackoverflow.com/questions/76118183/mui-datagrid-height-exceeds-parents-div-when-the-rows-are-more-than-the-height
    <Box sx={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
      <Box sx={{ position: 'absolute', height: '100%', width: '100%' }}>
        <DataGrid
          autosizeOnMount
          disableColumnMenu
          disableRowSelectionOnClick
          unstable_rowSpanning
          apiRef={dataGridApiRef}
          columns={columns}
          getRowId={(r) => r.id}
          hideFooter="true"
          processRowUpdate={handleRowUpdate}
          rows={rows}
          autosizeOptions={{
            columns: ['feature', 'actions'],
            includeOutliers: true,
            includeHeaders: true,
          }}
          columnVisibilityModel={{
            month: startMonth !== endMonth,
          }}
          getRowClassName={(params) => {
            // Highlight changed rows
            if (params.row.value !== params.row.new_value) {
              return 'changed-row';
            }
            return params.indexRelativeToCurrentPage % 2 === 0 ? '' : 'even';
          }}
          sx={{
            borderRadius: '9px',
            // To disable cell/column header highlight on click - see https://github.com/mui/mui-x/issues/8104
            '& .MuiDataGrid-columnHeaderTitleContainer, & .MuiDataGrid-cell': {
              outline: 'transparent',
            },
            '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus-within':
              {
                outline: 'none',
              },
            '& .border-cell': {
              borderRight: '2px solid rgba(180, 180, 180, 0.6)',
              // backgroundColor: 'red',
            },
            '& .changed-row': {
              // borderRight: '2px solid black',
              backgroundColor: 'rgba(255, 222, 74, 0.5)',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 228, 0.15)',
              // color: "red"
            },
            '& .changed-row.MuiDataGrid-row:hover': {
              // borderRight: '2px solid black',
              backgroundColor: 'rgba(128, 111, 151, 0.3)',
            },
            '& .editing-row': {
              backgroundColor: 'rgba(255, 222, 74, 0.9)',
              // color: "red"
            },
            '& .even': {
              backgroundColor: 'rgba(180, 180, 180, 0.15)',
            },
          }}
          // This callback saves the updated row to state after every cell edit,
          // triggering a rerender. See comments under pivot() and pChange's valueSetter for details.
          onProcessRowUpdateError={() => console.log('failed to update')}
        />
      </Box>
    </Box>
  );
}

FeatureEditor.propTypes = {
  deltasState: PropTypes.array.isRequired,
};
