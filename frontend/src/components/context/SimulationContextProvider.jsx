import React, { useReducer } from 'react';
import {
  SimulationContext,
  SimulationDispatchContext,
} from './SimulationContext';

export function SimulationContextProvider({ children }) {
  const [simulation, dispatch] = useReducer(simulationReducer, DEFAULT_SIM);

  return (
    <SimulationContext.Provider value={simulation}>
      <SimulationDispatchContext.Provider value={dispatch}>
        {children}
      </SimulationDispatchContext.Provider>
    </SimulationContext.Provider>
  );
}

/**
 *
 *
 * @param {*} simulation previous simulation state
 * @param {*} action dispatch action
 * @return {*} new simulation state
 */
function simulationReducer(simulation, action) {
  switch (action.type) {
    case 'update_selected_project': {
      return {
        ...simulation,
        selectedProject: action.selectedValue,
      };
    }
    default: {
      throw Error('Unknown simulationReducer action: ' + action.type);
    }
  }
}

const DEFAULT_SIM = {
  selectedProject: null, // Mirrors format of <Autocomplete/> options
  selectedProjectData: {
    id: null,
    details: null,
    predictions: [],
    features: [],
  },
  simulationData: {
    periods: [],
    changes: [],
    selectedPeriod: null,
    selectedFeature: null,
  },
};

const DUMMY_SIM = {
  selectedProject: {
    project_id: '1',
    project_name: 'Amaterasu',
    status: 'Retired',
  },
  selectedProjectData: {
    id: '112',
    details: {
      project_name: 'FtpServer',
      start_date: '3/29/2003',
      end_date: '12/18/2007',
      status: 1,
      pj_github_url: 'https://github.com/apache/FtpServer',
      intro: 'A complete FTP Server based on Mina I/O system.',
      sponsor: 'Incubator',
    },
    predictions: [],
    features: [],
  },
  simulationData: {
    periods: [{ startMonth: 1, stopMonth: 1 }],
    changes: [],
    selectedPeriod: { startMonth: 1, stopMonth: 1 },
    selectedFeature: 'num_commits',
  },
};

SimulationContextProvider.propTypes = {
  children: React.ReactNode,
};
