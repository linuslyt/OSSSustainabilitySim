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
import React, { useMemo, useState } from 'react';
import {
  useSimulation,
  useSimulationDispatch,
} from '../context/SimulationContext';
import {
  GET_PROJECT_DETAILS,
  GET_PROJECT_HISTORICAL_DATA,
  LIST_PROJECTS,
} from '../endpoints';

// TODO: set default
// TODO: add confirm dialogue when changing project with non-empty simulated changes
function ProjectSelect() {
  const simContext = useSimulation();
  const simDispatch = useSimulationDispatch();
  const [options, setOptions] = useState([]);

  const projectOptions = useMemo(() => {
    fetch(LIST_PROJECTS)
      .then((res) => res.json())
      .then((json) => {
        const sortedOptions = json.projects.sort(
          (a, b) =>
            -b.status.localeCompare(a.status) ||
            -b.project_name[0]
              .toUpperCase()
              .localeCompare(a.project_name[0].toUpperCase()),
        );
        setOptions(json.projects);
      });
    return [];
  }, []);

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

  const handleSelectProject = async (selected) => {
    try {
      // Get project details + prediction history
      const detailsParams = new URLSearchParams();
      detailsParams.append('project_id', selected.project_id);
      const detailsRes = await fetch(`${GET_PROJECT_DETAILS}?${detailsParams}`);
      const detailsJson = await detailsRes.json();
      // console.log(detailsJson);

      // Get historical feature data
      const histDataParams = new URLSearchParams();
      // histDataParams.append('num_months', projectDetails.history.length);
      histDataParams.append(
        'num_months',
        detailsJson.prediction_history.length,
      );
      histDataParams.append('project_id', selected.project_id);
      const featuresRes = await fetch(
        `${GET_PROJECT_HISTORICAL_DATA}?${histDataParams}`,
      );
      const featuresJson = await featuresRes.json();
      // console.log(featuresJson);
      simDispatch({
        type: 'set_selected_project',
        selectedValue: selected,
        id: selected.project_id,
        projectDetails: detailsJson,
        historicalFeatureData: featuresJson,
      });
    } catch (e) {
      // TODO: add Snackbar for fetch feedback
      console.log(e);
      simDispatch({
        type: 'set_selected_project',
        selectedValue: selected,
        id: selected.project_id,
        projectDetails: {},
        historicalFeatureData: {},
      });
    }
  };

  return (
    <div className="project-select">
      <Autocomplete
        blurOnSelect
        clearOnEscape
        disableClearable
        handleHomeEndKeys
        selectOnFocus
        getOptionLabel={(option) => option?.project_name ?? ''}
        groupBy={(option) => option.status}
        options={options}
        renderOption={renderOptionWithAutocomplete}
        size="small"
        sx={{ width: 300, '& fieldset': { borderRadius: 3 } }}
        value={simContext.selectedProject}
        isOptionEqualToValue={(option, value) =>
          option.project_id === value?.project_id
        }
        renderInput={(params) => (
          <TextField {...params} label="Select project" />
        )}
        onChange={(_, selected) => handleSelectProject(selected)}
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
            href="https://incubator.apache.org/"
            rel="noopener"
            sx={{ marginRight: '1rem', verticalAlign: 'middle' }}
            target="_blank"
          >
            ASFI
          </Link>
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
