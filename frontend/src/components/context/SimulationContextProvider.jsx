import React, { useEffect, useReducer } from 'react';
import { DUMMY_CHANGES, DUMMY_DATA } from '../UpdateFeatures/constants';
import {
  getNewValueFromPChange,
  getPercentChange,
  getRowId,
  pivot,
} from '../utils.js';
import {
  SimulationContext,
  SimulationDispatchContext,
} from './SimulationContext';

export function SimulationContextProvider({ children }) {
  const [simulation, dispatch] = useReducer(simulationReducer, DUMMY_SIM);

  useEffect(() => {
    console.log('Saved changes updated: ', simulation.simulationData.changes);
  }, [simulation.simulationData.changes]);

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
    case 'set_selected_project': {
      // TODO: load data from server into selectedProjectData
      return {
        ...prev,
        selectedProject: action.selectedValue,
      };
    }
    case 'set_selected_period': {
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
          ([, change]) => !isInPeriod(change.month),
        ),
      );
      const newChangedMonths = new Set(
        Array.from(prev.simulationData.changedMonths).filter(
          (m) => !isInPeriod(m),
        ),
      );
      const newSelectedPeriod =
        prev.simulationData.selectedPeriod.key === action.period.key
          ? newChangedPeriods.length > 0
            ? newChangedPeriods[newChangedPeriods.length - 1]
            : null
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
    case 'delete_change': {
      const newChanges = new Map(prev.simulationData.changes);
      newChanges.delete(action.gridRowParams.id);
      return {
        ...prev,
        simulationData: {
          ...prev.simulationData,
          changes: newChanges,
        },
      };
    }
    case 'set_change': {
      if (action.updatedRow.new_value === action.updatedRow.value) return prev;
      const newChanges = new Map(prev.simulationData.changes);
      newChanges.set(action.updatedRow.id, {
        month: action.updatedRow.month,
        feature: action.updatedRow.feature,
        new_value: action.updatedRow.new_value,
      });
      return {
        ...prev,
        simulationData: {
          ...prev.simulationData,
          changes: newChanges,
        },
      };
    }
    case 'copy_change_to_range': {
      const { row } = action.gridRowParams;

      const newChanges = new Map(prev.simulationData.changes);
      const { startMonth, endMonth } = prev.simulationData.selectedPeriod;
      for (let m = startMonth; m <= endMonth; m++) {
        const id = getRowId(m, row.feature);
        const pChange = getPercentChange(row.new_value, row.value);

        if (pChange === 0) {
          // changes should only include non-zero changes
          newChanges.delete(id);
        } else {
          const oldValue = pivot(
            prev.selectedProjectData.features,
            prev.simulationData.changes,
          ).find((r) => r.feature === row.feature && r.month === m).value;

          const newValue = getNewValueFromPChange(
            row.feature,
            oldValue,
            pChange,
          );
          newChanges.set(id, {
            month: row.month,
            feature: row.feature,
            new_value: newValue,
          });
        }
      }

      return {
        ...prev,
        simulationData: {
          ...prev.simulationData,
          changes: newChanges,
        },
      };
    }
    case 'set_selected_feature': {
      return {
        ...prev,
        selectedFeature: {
          feature: action.gridRowParams.row.feature,
          month: action.gridRowParams.row.month,
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
    features: DUMMY_DATA,
  },
  selectedFeature: {
    feature: 'num_commits',
    month: 1,
  },
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
