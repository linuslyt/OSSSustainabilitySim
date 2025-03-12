import HelpIcon from '@mui/icons-material/Help';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReplayIcon from '@mui/icons-material/Replay';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
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

/* Helpers */
function getRowId(month, feature) {
  // TODO: move this to pivot and change getId to row.id
  return month + '-' + feature;
}

function getPercentChange(newVal, oldVal) {
  return parseFloat((((newVal - oldVal) / oldVal) * 100.0).toFixed(1));
}

function getNewValueFromPChange(feature, oldVal, pChange) {
  return FEATURE_TYPES.get(feature) === 'INTEGER'
    ? Math.round(oldVal * (1 + pChange / 100))
    : parseFloat((oldVal * (1 + pChange / 100)).toFixed(2)); // 2 d.p. for new_value
}

export default function FeatureEditor({ deltasState }) {
  /* State */
  // TODO: convert to react context
  const [deltas, setDeltas] = deltasState;
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
    return data
      .flatMap(({ month, ...rest }) =>
        Object.entries(rest).map(([feature, value]) => ({
          month,
          feature,
          value,
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
    console.log(updatedRow, changes);
    const id = getRowId(updatedRow.month, updatedRow.feature);
    changes.set(id, {
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
            direction="row"
            alignItems="center"
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
        // Derive from new_value and original value. Use 1 d.p. in % units for pChange.
        return getPercentChange(row.new_value, row.value);
      },
      valueSetter: (pChange, row) => {
        // Update new_value by pChange. Round depending on feature type.
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
          <Tooltip title="Reset" key={params.id + '_reset'}>
            <GridActionsCellItem
              icon={<ReplayIcon />}
              label="Reset"
              className="textPrimary"
              onClick={() => handleReset(params)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip
            title="Copy % change to all months for feature"
            key={params.id + '_copyToAll'}
          >
            <GridActionsCellItem
              icon={<SouthWestIcon />}
              label="CopyToAllMonthsForFeature"
              onClick={() => handleCopyToAllMonths(params)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Inspect feature" key={params.id + '_inspectFeature'}>
            <GridActionsCellItem
              icon={<QueryStatsIcon />}
              label="InspectFeature"
              onClick={() => handleInspect(params.row)}
              color="inherit"
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
          rows={rows}
          columns={columns}
          disableColumnMenu
          hideFooter="true"
          disableRowSelectionOnClick
          unstable_rowSpanning
          columnVisibilityModel={{
            month: startMonth !== endMonth,
          }}
          getRowId={(r) => getRowId(r.month, r.feature)} // TODO: memoize
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
          getRowClassName={(params) => {
            // Highlight changed rows
            if (params.row.value !== params.row.new_value) {
              return 'changed-row';
            }
            return params.indexRelativeToCurrentPage % 2 === 0 ? '' : 'even';
          }}
          autosizeOnMount
          autosizeOptions={{
            columns: ['feature', 'actions'],
            includeOutliers: true,
            includeHeaders: true,
          }}
          apiRef={dataGridApiRef}
          processRowUpdate={handleRowUpdate}
          onProcessRowUpdateError={() => console.log('failed to update')}
        />
      </Box>
    </Box>
  );
}
