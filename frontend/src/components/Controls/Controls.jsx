import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import './index.css';

function ProjectSelect({ projectState }) {
  const [projectId, setProjectId] = projectState;
  // TODO: fetch from backend
  const projectOptions = useMemo(
    () => [
      {
        project_id: '1',
        project_name: 'Amaterasu',
        status: 'Retired',
      },
      {
        project_id: '2',
        project_name: 'Annotator',
        status: 'Retired',
      },
      {
        project_id: '3',
        project_name: 'BatchEE',
        status: 'Retired',
      },
      {
        project_id: '4',
        project_name: 'BRPC',
        status: 'Retired',
      },
      {
        project_id: '242',
        project_name: 'Usergrid',
        status: 'Graduated',
      },
      {
        project_id: '243',
        project_name: 'VCL',
        status: 'Graduated',
      },
      {
        project_id: '244',
        project_name: 'VXQuery',
        status: 'Graduated',
      },
    ],
    [],
  );

  const renderOptionWithAutocomplete = (props, option, { inputValue }) => {
    // eslint-disable-next-line react/prop-types
    const { key, ...optionProps } = props;
    const matches = match(option.project_name, inputValue, {
      insideWords: true,
    });
    const parts = parse(option.project_name, matches);

    return (
      <li key={key} {...optionProps}>
        <div>
          {parts.map((part, index) => (
            <span
              key={index}
              style={{ fontWeight: part.highlight ? 700 : 400 }}
            >
              {part.text}
            </span>
          ))}
        </div>
      </li>
    );
  };

  return (
    <div className="project-select">
      <Autocomplete
        options={projectOptions.sort(
          (a, b) =>
            -b.project_name[0]
              .toUpperCase()
              .localeCompare(a.project_name[0].toUpperCase()),
        )}
        groupBy={(option) => option.status}
        getOptionLabel={(option) => option?.project_name ?? ''}
        sx={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="Select project" />
        )}
        renderOption={renderOptionWithAutocomplete}
        value={projectId}
        onChange={(event, newVal) => {
          setProjectId(newVal);
        }}
        isOptionEqualToValue={(option, value) =>
          option.project_id === value?.project_id
        }
        selectOnFocus
        clearOnEscape
        handleHomeEndKeys
      />
      <p>Selected project id: {projectId?.project_id}</p>
    </div>
  );
}

export default function Controls({ projectState, dashboardState }) {
  const [dashboardView, setDashboardView] = dashboardState;
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="controls-container">
      <ProjectSelect projectState={projectState} />
      <div className="dashboard-mode-toggle">test</div>
      <div className="month-range-select">test</div>
    </div>
  );
}

Controls.propTypes = {
  projectState: PropTypes.array.isRequired,
  dashboardState: PropTypes.array.isRequired,
};
