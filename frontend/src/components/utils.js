import { FEATURE_ORDER, FEATURE_TYPES } from './UpdateFeatures/constants';

/* Helpers */
export function getRowId(month, feature) {
  return month + '-' + feature;
}

export function getPercentChange(newVal, oldVal) {
  // 1 d.p. in % units for pChange.
  return Math.round(((newVal - oldVal) / oldVal) * 100.0 * 1e1) / 1e1;
}

export function getNewValueFromPChange(feature, oldVal, pChange) {
  // 2 d.p. for new_value
  return FEATURE_TYPES.get(feature) === 'INTEGER'
    ? Math.round(oldVal * (1 + pChange / 100))
    : Math.round(oldVal * (1 + pChange / 100) * 1e3) / 1e3;
}

export function pivot(data, changes) {
  // Whenever a cell is updated, changes are persisted in simContext by the processRowUpdate callback which triggers a rerender.
  // pivot() runs on every render and pulls new_values fresh from `changes`. Since the pChange column is later derived from new_value,
  // the simulated value and % change columns will always be synced and kept updated.
  //
  // To avoid calling pivot() during every render (cell edit), one could persist cell edits to `changes` only on changes to the
  // selected delta, feature, or project. If pivot is not called every render, the valueSetter callback defined for the pChange
  // column will then be used to keep pChange and new_value columns synced.

  // console.log('pivoting');

  return data
    .flatMap(({ month, ...rest }) =>
      Object.entries(rest).map(([feature, value]) => {
        const formattedValue =
          FEATURE_TYPES.get(feature) === 'INTEGER'
            ? value
            : Math.round(value * 1e3) / 1e3;
        const formattedNewValue = changes.has(getRowId(month, feature))
          ? changes.get(getRowId(month, feature)).new_value
          : formattedValue;
        return {
          id: getRowId(month, feature),
          month,
          feature,
          value: formattedValue,
          // Simulated value
          new_value: formattedNewValue,
        };
      }),
    )
    .sort(
      (a, b) =>
        FEATURE_ORDER.indexOf(a.feature) - FEATURE_ORDER.indexOf(b.feature) ||
        a.month - b.month,
    );
}

const integerValidator = (newValue) =>
  newValue >= 0 && !Object.is(newValue, -0) && Number.isInteger(newValue);

const percentageValidator = (newValue) =>
  newValue >= 0.0 && !Object.is(newValue, -0.0) && newValue <= 1.0;

const decimalValidator = (newValue) =>
  newValue >= 0.0 && !Object.is(newValue, -0.0);

export const FEATURE_VALIDATOR_MAP = new Map(
  Object.entries({
    c_percentage: percentageValidator,
    e_percentage: percentageValidator,
    // NOTE: Logically, these should also be nondecreasing.
    //       However, this would require 1) checking it's >= previous month's value, and
    //       2) Adding the same offset to all remaining months' values when changed.
    active_devs: integerValidator,
    num_commits: integerValidator,
    num_files: integerValidator,
    num_emails: integerValidator,
    // NOTE: Logically, these should also be <= the total time intervals elapsed from
    //       project start to the current month.
    inactive_c: percentageValidator,
    inactive_e: percentageValidator,
    // NOTE: Logically, these should have extra constraints depending on how the network is defined.
    //       e.g. perhaps c_nodes should correspond to the number of commits.
    c_nodes: integerValidator,
    c_edges: integerValidator,
    c_c_coef: percentageValidator,
    e_nodes: integerValidator,
    e_edges: integerValidator,
    e_c_coef: percentageValidator,
    // NOTE: Logically, these should not exceed *_nodes.
    c_mean_degree: decimalValidator,
    c_long_tail: decimalValidator,
    e_mean_degree: decimalValidator,
    e_long_tail: decimalValidator,
  }),
);
