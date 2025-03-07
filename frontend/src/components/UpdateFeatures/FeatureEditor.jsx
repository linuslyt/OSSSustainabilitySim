import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import * as React from 'react';

// TODO: show month column if range is not 1. https://mui.com/x/react-data-grid/column-visibility/
// TODO: highlight rows if changed
// TODO: replace dummies with legit features
// TODO: replace column3 with edit box
// TODO: hook up selectedDelta state and pull changes from deltas state
export default function FeatureEditor() {
  const rows = [
    { id: 1, col1: 'Hello', col2: 'World' },
    { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 3, col1: 'MUI', col2: 'is Amazing' },
    { id: 4, col1: 'Hello', col2: 'World' },
    { id: 5, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 6, col1: 'MUI', col2: 'is Amazing' },
    { id: 7, col1: 'Hello', col2: 'World' },
    { id: 8, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 9, col1: 'MUI', col2: 'is Amazing' },
    { id: 10, col1: 'MUI', col2: 'World' },
    { id: 11, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 12, col1: 'MUI', col2: 'is Amazing' },
  ];

  // row = feature
  // column1 = original; fixed
  // column2 = new value
  // column3 = edit by % +/-

  const columns = [
    { field: 'col1', headerName: 'Column 1', flex: 1 },
    { field: 'col2', headerName: 'Column 2', flex: 1 },
    { field: 'col3', headerName: 'Column 3', flex: 1 },
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
          sx={{
            borderRadius: '9px',
            // To disable cell/column header highlight on click - see https://github.com/mui/mui-x/issues/8104
            [`& .MuiDataGrid-columnHeaderTitleContainer, & .MuiDataGrid-cell:`]:
              {
                outline: 'transparent',
              },
            [`& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus-within`]:
              {
                outline: 'none',
              },
          }}
        />
      </Box>
    </Box>
  );
}
