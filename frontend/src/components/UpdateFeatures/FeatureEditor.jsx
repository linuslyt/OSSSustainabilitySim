import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReplayIcon from '@mui/icons-material/Replay';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { FEATURE_ORDER } from './constants';

// TODO: highlight rows if changed
// TODO: color
// TODO: header border to separate original/simulated columns
// TODO: convert to react context
// TODO: alternating colors for features/months
// TODO: renderCell tooltip for feature name

// Data from server: array of objects. Pivot to array of monthly feature values.
function pivot(data) {
  return data
    .flatMap(({ month, ...rest }) =>
      Object.entries(rest).map(([feature, value]) => ({
        month,
        feature,
        value,
      })),
    )
    .sort(
      (a, b) =>
        FEATURE_ORDER.indexOf(a.feature) - FEATURE_ORDER.indexOf(b.feature) ||
        a.month - b.month,
    );
}

export default function FeatureEditor({ deltasState }) {
  const [deltas, setDeltas] = deltasState;
  const selectedDelta = deltas.deltas.find(
    (d) => d.key === deltas.selectedDelta,
  );
  const { _, startMonth, endMonth } = selectedDelta;
  // TODO: get data from server
  const data = [
    {
      month: 1,
      active_devs: 10,
      num_commits: 50,
      num_files: 20,
      num_emails: 15,
      c_percentage: 0.7,
      e_percentage: 0.3,
      inactive_c: 5,
      inactive_e: 2,
      c_nodes: 30,
      c_edges: 50,
      c_c_coef: 0.6,
      c_mean_degree: 2.5,
      c_long_tail: 0.1,
      e_nodes: 25,
      e_edges: 40,
      e_c_coef: 0.55,
      e_mean_degree: 2,
      e_long_tail: 0.05,
    },
    {
      month: 2,
      active_devs: 10,
      num_commits: 100,
      num_files: 26,
      num_emails: 13,
      c_percentage: 0.78,
      e_percentage: 0.34,
      inactive_c: 6,
      inactive_e: 3,
      c_nodes: 32,
      c_edges: 54,
      c_c_coef: 0.7,
      c_mean_degree: 2.8,
      c_long_tail: 0.4,
      e_nodes: 26,
      e_edges: 44,
      e_c_coef: 0.5,
      e_mean_degree: 3,
      e_long_tail: 0.15,
    },
    {
      month: 3,
      active_devs: 10,
      num_commits: 50,
      num_files: 20,
      num_emails: 15,
      c_percentage: 0.7,
      e_percentage: 0.3,
      inactive_c: 5,
      inactive_e: 2,
      c_nodes: 30,
      c_edges: 50,
      c_c_coef: 0.6,
      c_mean_degree: 2.5,
      c_long_tail: 0.1,
      e_nodes: 25,
      e_edges: 40,
      e_c_coef: 0.55,
      e_mean_degree: 2,
      e_long_tail: 0.05,
    },
    {
      month: 4,
      active_devs: 10,
      num_commits: 100,
      num_files: 26,
      num_emails: 13,
      c_percentage: 0.78,
      e_percentage: 0.34,
      inactive_c: 6,
      inactive_e: 3,
      c_nodes: 32,
      c_edges: 54,
      c_c_coef: 0.7,
      c_mean_degree: 2.8,
      c_long_tail: 0.4,
      e_nodes: 26,
      e_edges: 44,
      e_c_coef: 0.5,
      e_mean_degree: 3,
      e_long_tail: 0.15,
    },
    {
      month: 5,
      active_devs: 10,
      num_commits: 100,
      num_files: 26,
      num_emails: 13,
      c_percentage: 0.78,
      e_percentage: 0.34,
      inactive_c: 6,
      inactive_e: 3,
      c_nodes: 32,
      c_edges: 54,
      c_c_coef: 0.7,
      c_mean_degree: 2.8,
      c_long_tail: 0.4,
      e_nodes: 26,
      e_edges: 44,
      e_c_coef: 0.5,
      e_mean_degree: 3,
      e_long_tail: 0.15,
    },
  ];

  const selectedData = data.filter(
    (d) => d.month >= startMonth && d.month <= endMonth,
  );

  const [changes, setChanges] = useState([
    {
      month: 1,
      feature: 'num_commits',
      newValue: 15,
    },
    {
      month: 3,
      feature: 'active_devs',
      newValue: 12,
    },
  ]);

  // TODO: add state to keep track of changed features. store new simulated value not %.
  const rows = pivot(selectedData);
  // DATA:
  // array of objects
  // objects in form in constants.js
  // one object per month
  // to initialize, populate from start_range to end_range
  // DELTAS:
  // array of objects (sparse)
  // if null no change

  function handleReset(row) {
    setChanges((prev) =>
      prev.filter((c) => !(c.month === row.month && c.feature === row.feature)),
    );
  }

  function handleCopyToAllMonths(row) {
    // Save current change
    const changeToCopy = changes.find(
      (c) => c.month === row.month && c.feature === row.feature,
    );

    if (changeToCopy === undefined) {
      // No change defined - reset to 0 for all months.
      for (let i = selectedDelta.startMonth; i <= selectedDelta.endMonth; i++) {
        handleReset({ ...row, month: i });
      }
      return;
    }

    let newValuesForMonth = [];
    for (let i = selectedDelta.startMonth; i <= selectedDelta.endMonth; i++) {
      if (i === row.month) continue;
      newValuesForMonth.push({
        month: i,
        feature: changeToCopy.feature,
        newValue: changeToCopy.newValue,
      });
    }
    setChanges((prev) => [...prev, ...newValuesForMonth]);
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

  const columns = [
    {
      field: 'feature',
      headerName: 'Feature',
      flex: 1,
    },
    {
      field: 'month',
      headerName: 'Month',
      flex: 1,
    },
    {
      field: 'value',
      headerName: 'Original value',
      // headerClassName: 'border-cell',
      flex: 1,
      cellClassName: 'border-cell',
      rowSpanValueGetter: () => null,
    },
    {
      field: 'simVal',
      headerName: 'Simulated value',
      editable: 1,
      flex: 1,
      valueGetter: (_, row) => {
        // TODO: validate changes. -100% is max negative change. no max positive change. integers vs decimals.
        const change = changes.find(
          (d) => d.feature === row.feature && d.month === row.month,
        );
        return change ? change.newValue : row.value;
      },
      rowSpanValueGetter: () => null,
    },
    {
      field: 'pChange',
      headerName: '% change simulated',
      editable: 1,
      flex: 1,
      valueGetter: (_, row) => {
        // TODO: validate changes. -100% is max negative change. no max positive change.
        const change = changes.find(
          (d) => d.feature === row.feature && d.month === row.month,
        );
        return change ? ((change.newValue - row.value) / row.value) * 100 : 0;
      },
      // TODO: fix valueFormatter throwing NPE on editing even with null check. Probably needs
      // valueParser for editing to be implemented.
      valueFormatter: (value) => {
        return value === null ? '' : `${value?.toFixed(0).toLocaleString()}%`;
      },
      rowSpanValueGetter: () => null,
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
              onClick={() => handleReset(params.row)}
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
              onClick={() => handleCopyToAllMonths(params.row)}
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
  return (
    // Double Box is a weird hack to prevent DataGrid from overflowing height.
    // See: https://stackoverflow.com/questions/76118183/mui-datagrid-height-exceeds-parents-div-when-the-rows-are-more-than-the-height
    <Box sx={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
      <Box sx={{ position: 'absolute', height: '100%', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnSorting
          disableColumnMenu
          hideFooter="true"
          disableRowSelectionOnClick
          unstable_rowSpanning
          columnVisibilityModel={{
            month: startMonth !== endMonth, // TODO: if delta range > 1
          }}
          getRowId={(r) => r.month + '_' + r.feature}
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
              borderRight: '2px solid black',
              // backgroundColor: 'red',
            },
          }}
        />
      </Box>
    </Box>
  );
}
