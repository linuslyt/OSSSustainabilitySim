import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import './index.css';

// TODO: convert to MUI AppBar/Toolbar
// TODO: convert divs to Box's
// TODO: convert css to inline sx styling
function ProjectSelect({ projectState }) {
  const [selectedProject, setSelectedProject] = projectState;
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
        value={selectedProject}
        onChange={(event, newVal) => {
          setSelectedProject(newVal);
        }}
        isOptionEqualToValue={(option, value) =>
          option.project_id === value?.project_id
        }
        selectOnFocus
        clearOnEscape
        handleHomeEndKeys
        size="small"
      />
    </div>
  );
}

export default function Header({ projectState }) {
  return (
    <div className="header-container">
      <ProjectSelect projectState={projectState} />

      <div>
        <Typography variant="h1">
          ASFI Project Sustainability Simulator
        </Typography>
      </div>
      <div className="links">
        <Link
          className="link"
          href="https://arxiv.org/abs/2105.14252"
          target="_blank"
          rel="noopener"
        >
          Yin et al.
        </Link>
        <Link
          className="link"
          href="http://zenodo.org/records/4564072"
          target="_blank"
          rel="noopener"
        >
          Original Models/Data
        </Link>
        <IconButton
          className="link"
          onClick={() =>
            window.open('https://github.com/linuslyt/OSSSustainabilitySim')
          }
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          onClick={() =>
            window.open(
              'https://github.com/linuslyt/OSSSustainabilitySim/blob/main/frontend/README.md',
            )
          }
        >
          <HelpIcon />
        </IconButton>
      </div>
    </div>
  );
}

Header.propTypes = {
  projectState: PropTypes.array.isRequired,
};

ProjectSelect.propTypes = {
  projectState: PropTypes.array.isRequired,
};
