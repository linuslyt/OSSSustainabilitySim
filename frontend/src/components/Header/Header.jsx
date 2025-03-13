import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useMemo } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';

// TODO: add link to ASFI
// TODO: information IconButton that reveals project info/authors/status etc
// TODO: set default and disable clearing dropdown
function ProjectSelect() {
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();

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
        blurOnSelect
        clearOnEscape
        handleHomeEndKeys
        selectOnFocus
        getOptionLabel={(option) => option?.project_name ?? ''}
        groupBy={(option) => option.status}
        renderOption={renderOptionWithAutocomplete}
        size="small"
        sx={{ width: 300, '& fieldset': { borderRadius: 3 } }}
        value={simContext.selectedProject}
        isOptionEqualToValue={(option, value) =>
          option.project_id === value?.project_id
        }
        options={projectOptions.sort(
          (a, b) =>
            -b.project_name[0]
              .toUpperCase()
              .localeCompare(a.project_name[0].toUpperCase()),
        )}
        renderInput={(params) => (
          <TextField {...params} label="Select project" />
        )}
        onChange={(_, selected) => {
          console.log(selected);
          simDispatch({
            type: 'set_selected_project',
            selectedValue: selected,
          });
        }}
      />
    </div>
  );
}

export default function Header() {
  return (
    <AppBar
      component="nav"
      elevation={0}
      position="sticky"
      sx={{ backgroundColor: 'lightgrey' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <ProjectSelect />
        <Typography color="black" fontSize="1.5rem" variant="h1">
          ASFI Project Sustainability Simulator
        </Typography>
        <Box>
          <Link
            href="https://arxiv.org/abs/2105.14252"
            rel="noopener"
            sx={{ marginRight: '1rem', verticalAlign: 'middle' }}
            target="_blank"
          >
            Yin et al.
          </Link>
          <Link
            href="http://zenodo.org/records/4564072"
            rel="noopener"
            sx={{ marginRight: '1rem', verticalAlign: 'middle' }}
            target="_blank"
          >
            Original Models/Data
          </Link>
          <IconButton
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}
