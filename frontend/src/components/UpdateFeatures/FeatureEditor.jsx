import HelpIcon from '@mui/icons-material/Help';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReplayIcon from '@mui/icons-material/Replay';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';
import {
  FEATURE_VALIDATOR_MAP,
  getNewValueFromPChange,
  getPercentChange,
  pivot,
} from '../utils.js';
import { FEATURE_DESCRIPTIONS } from './constants';

// TODO: documentation
// TODO: known issue - if you edit then exit editing too quick (e.g. typing new value then pressing enter right after),
//       it will fail to save, and you have to re-click and re-exit to save it properly.
export default function FeatureEditor() {
  const dataGridApiRef = useGridApiRef(); // Ref for DataGrid. Used to call DataGrid actions programmatically.
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();

  const { startMonth, endMonth } = simContext.simulationData.selectedPeriod
    ? simContext.simulationData.selectedPeriod
    : { startMonth: -1, endMonth: -1 };
  const selectedData = simContext.selectedProjectData.features.filter(
    (d) => d.month >= startMonth && d.month <= endMonth,
  );

  useEffect(() => {
    // Autosize columns on data update
    dataGridApiRef.current?.autosizeColumns({
      columns: ['feature', 'actions'],
      includeOutliers: true,
      includeHeaders: true,
    });
  }, [dataGridApiRef, simContext.selectedPeriod]);

  const rows = pivot(selectedData, simContext.simulationData.changes);
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
            sx={{ width: 'fit-content', mr: 0.5 }}
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
        // Setting `error: true` prevents MUI from saving the new value. Presenting the error needs to be done manually.
        // See: https://github.com/mui/mui-x/issues/8854#issuecomment-1534730413
        // TODO: wrap renderEditCell to highlight cell as invalid
        const validator = FEATURE_VALIDATOR_MAP.get(params.row.feature);
        return { ...params.props, error: !validator(params.props.value) };
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
        // Setting `error: true` prevents MUI from saving the new value. Presenting the error needs to be done manually.
        // See: https://github.com/mui/mui-x/issues/8854#issuecomment-1534730413
        // TODO: wrap renderEditCell to highlight cell as invalid
        const validator = FEATURE_VALIDATOR_MAP.get(params.row.feature);
        // Value is in % units. Convert to new actual value for validation.
        const newValue = getNewValueFromPChange(
          params.row.feature,
          params.row.value,
          params.props.value,
        );
        return { ...params.props, error: !validator(newValue) };
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
              onClick={() =>
                simDispatch({ type: 'delete_change', gridRowParams: params })
              }
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
              onClick={() =>
                simDispatch({
                  type: 'copy_change_to_range',
                  gridRowParams: params,
                })
              }
            />
          </Tooltip>,
          <Tooltip key={params.id + '_inspectFeature'} title="Inspect feature">
            <GridActionsCellItem
              color="inherit"
              icon={<QueryStatsIcon />}
              label="InspectFeature"
              onClick={() =>
                simDispatch({
                  type: 'set_selected_feature',
                  gridRowParams: params,
                })
              }
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    // Double Box is a weird hack to prevent DataGrid from overflowing height.
    // See: https://stackoverflow.com/questions/76118183/mui-datagrid-height-exceeds-parents-div-when-the-rows-are-more-than-the-height
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
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
          // This callback saves the updated row to state after every cell edit,
          // triggering a rerender. See comments under pivot() and pChange's valueSetter for details.
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
          localeText={{
            noRowsLabel:
              'Create a change period to view/simulate changes to features.',
          }}
          processRowUpdate={(updatedRow) => {
            simDispatch({ type: 'set_change', updatedRow });
            return updatedRow;
          }}
          sx={{
            borderRadius: '9px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            // To disable cell/column header highlight on click - see https://github.com/mui/mui-x/issues/8104
            '& .MuiDataGrid-columnHeaderTitleContainer, & .MuiDataGrid-cell': {
              outline: 'transparent',
            },
            '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus-within':
              {
                outline: 'none',
              },
            '& .border-cell': {
              borderRight: '3px solid rgba(180, 180, 180, 0.6)',
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
          onProcessRowUpdateError={() => console.log('failed to update')}
        />
      </Box>
    </Box>
  );
}

FeatureEditor.propTypes = {
  deltasState: PropTypes.array.isRequired,
};
