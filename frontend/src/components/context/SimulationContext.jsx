import { createContext, useContext } from 'react';

export const SimulationContext = createContext(null);
export const SimulationDispatchContext = createContext(null);

export function useSimulation() {
  return useContext(SimulationContext);
}

export function useSimulationDispatch() {
  return useContext(SimulationDispatchContext);
}
