import { FEATURE_ORDER, FEATURE_TYPES } from './UpdateFeatures/constants';

/* Helpers */
export function getRowId(month, feature) {
  return month + '-' + feature;
}

export function getPercentChange(newVal, oldVal) {
  // 1 d.p. in % units for pChange.
  return parseFloat((((newVal - oldVal) / oldVal) * 100.0).toFixed(1));
}

export function getNewValueFromPChange(feature, oldVal, pChange) {
  // 2 d.p. for new_value
  return FEATURE_TYPES.get(feature) === 'INTEGER'
    ? Math.round(oldVal * (1 + pChange / 100))
    : parseFloat((oldVal * (1 + pChange / 100)).toFixed(2));
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
      Object.entries(rest).map(([feature, value]) => ({
        id: getRowId(month, feature),
        month,
        feature,
        value,
        // Simulated value
        new_value: changes.has(getRowId(month, feature))
          ? changes.get(getRowId(month, feature)).new_value
          : value,
      })),
    )
    .sort(
      (a, b) =>
        FEATURE_ORDER.indexOf(a.feature) - FEATURE_ORDER.indexOf(b.feature) ||
        a.month - b.month,
    );
}
