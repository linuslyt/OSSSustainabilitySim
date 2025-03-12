import React, { useReducer } from 'react';
import { DUMMY_CHANGES } from '../UpdateFeatures/constants';
import {
  SimulationContext,
  SimulationDispatchContext,
} from './SimulationContext';
export function SimulationContextProvider({ children }) {
  const [simulation, dispatch] = useReducer(simulationReducer, DUMMY_SIM);

  return (
    <SimulationContext.Provider value={simulation}>
      <SimulationDispatchContext.Provider value={dispatch}>
        {children}
      </SimulationDispatchContext.Provider>
    </SimulationContext.Provider>
  );
}

function simulationReducer(prev, action) {
  switch (action.type) {
    case 'update_selected_project': {
      return {
        ...prev,
        selectedProject: action.selectedValue,
      };
    }
    case 'update_selected_period': {
      return {
        ...prev,
        simulationData: {
          ...prev.simulationData,
          selectedPeriod: action.period,
        },
      };
    }
    case 'delete_selected_period': {
      const newChangedPeriods = prev.simulationData.changedPeriods.filter(
        (p) => p.key !== action.period.key,
      );
      const isInPeriod = (month) =>
        month >= action.period.startMonth && month <= action.period.endMonth;
      const newChanges = new Map(
        [...prev.simulationData.changes.entries()].filter(
          ([key, change]) => !isInPeriod(change.month),
        ),
      );
      const newChangedMonths = new Set(
        Array.from(prev.simulationData.changedMonths).filter(
          (m) => !isInPeriod(m),
        ),
      );
      const newSelectedPeriod =
        prev.simulationData.selectedPeriod.key === action.period.key
          ? newChangedPeriods[newChangedPeriods.length - 1]
          : prev.simulationData.selectedPeriod;

      return {
        ...prev,
        simulationData: {
          changedPeriods: newChangedPeriods,
          changedMonths: newChangedMonths,
          changes: newChanges,
          selectedPeriod: newSelectedPeriod,
        },
      };
    }
    case 'add_new_period': {
      const { startMonth, endMonth } = action.period;
      const newPeriod = {
        key: `${startMonth}_${endMonth}`,
        startMonth,
        endMonth,
      };
      const newChangedMonths = prev.simulationData.changedMonths;
      for (let i = startMonth; i <= endMonth; i++) {
        newChangedMonths.add(i);
      }
      return {
        ...prev,
        simulationData: {
          ...prev.simulationData, // `changes` remains unchanged
          changedPeriods: [...prev.simulationData.changedPeriods, newPeriod],
          changedMonths: newChangedMonths,
          selectedPeriod: newPeriod,
        },
      };
    }
    default: {
      throw Error('Unknown simulationReducer action: ' + action.type);
    }
  }
}

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
  selectedFeature: 'num_commits',
  simulationData: {
    changedPeriods: [
      { key: '1_1', startMonth: 1, endMonth: 1 },
      { key: '2_2', startMonth: 2, endMonth: 2 },
      { key: '3_4', startMonth: 3, endMonth: 4 },
    ],
    changedMonths: new Set([1, 2, 3, 4]),
    changes: new Map(DUMMY_CHANGES.map((c) => [c.id, c.change])),
    selectedPeriod: { key: '1_1', startMonth: 1, endMonth: 1 },
  },
};

SimulationContextProvider.propTypes = {
  children: React.ReactNode,
};
