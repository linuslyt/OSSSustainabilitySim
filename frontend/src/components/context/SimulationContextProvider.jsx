import { pick } from 'lodash';
import React, { useEffect, useReducer } from 'react';
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

  useEffect(() => {
    console.log(
      'Saved project details updated: ',
      simulation.selectedProjectData,
    );
  }, [simulation.selectedProjectData]);

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
      const projectDetails = pick(action.projectDetails, [
        'project_name',
        'start_date',
        'end_date',
        'status',
        'pj_github_url',
        'intro',
        'sponsor',
      ]);

      return {
        ...DUMMY_SIM,
        selectedProject: action.selectedValue,
        selectedProjectData: {
          id: action.id,
          details: projectDetails,
          predictions: action.projectDetails.prediction_history || [],
          features: action.historicalFeatureData.history || [],
        },
      };
    }
    case 'set_selected_period': {
      return {
        ...prev,
        selectedFeature: {
          ...prev.selectedFeature,
          month: Math.round(
            action.period.startMonth + action.period.endMonth / 2,
          ),
        },
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
        selectedFeature: {
          ...prev.selectedFeature,
          month: newSelectedPeriod?.startMonth,
        },
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
      const newChangedMonths = new Set(prev.simulationData.changedMonths);
      for (let i = startMonth; i <= endMonth; i++) {
        newChangedMonths.add(i);
      }
      return {
        ...prev,
        selectedFeature: {
          ...prev.selectedFeature,
          month: newPeriod.startMonth,
        },
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
      const newChanges = new Map(prev.simulationData.changes);
      if (action.updatedRow.new_value === action.updatedRow.value) {
        // No simulated change. Remove if change was previously saved. Else noop.
        newChanges.delete(action.updatedRow.id);
      } else {
        newChanges.set(action.updatedRow.id, {
          month: action.updatedRow.month,
          feature: action.updatedRow.feature,
          new_value: action.updatedRow.new_value,
        });
      }
      return {
        ...prev,
        selectedFeature: {
          ...prev.selectedFeature,
          feature: action.updatedRow.feature,
        },
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
            month: m,
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
    case 'set_simulation_results': {
      console.log(
        `Simulated changes to project ${prev.selectedProjectData.id}.`,
      );
      console.log(
        'Original predictions:',
        prev.selectedProjectData.predictions,
      );
      console.log('Changes to simulate: ', prev.simulationData.changes);
      console.log('Simulation results:', action.data);
      return {
        ...prev,
        simulatedPredictions: action.data,
      };
    }
    case 'reset_simulation_results': {
      return {
        ...prev,
        simulatedPredictions: [],
      };
    }
    default: {
      throw Error('Unknown simulationReducer action: ' + action.type);
    }
  }
}

const DUMMY_SIM = {
  selectedProject: {},
  selectedProjectData: {
    id: null,
    details: {},
    predictions: [],
    features: [],
  },
  selectedFeature: {
    feature: 'active_devs',
    month: 1,
  },
  simulationData: {
    changedPeriods: [],
    changedMonths: new Set(),
    changes: new Map(),
    selectedPeriod: {},
  },
  simulatedPredictions: [],
};

SimulationContextProvider.propTypes = {
  children: React.ReactNode,
};
