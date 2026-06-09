/**
 * Core business logic hook for footprint calculation
 * Encapsulates all state + memoization for the survey → results flow
 * @module hooks/useFootprint
 */
import { useState, useCallback, useMemo } from 'react';
import {
  calculateMonthlyFootprint,
  calculateBreakdown,
  gradeFootprint,
} from '@/utils/calculations';

const INITIAL_TRANSPORT = { kmCar: 0, kmBus: 0, kmTrain: 0, flightHours: 0 };
const INITIAL_DIET = { dietType: 'none' };
const INITIAL_ENERGY = { kwhHome: 0, energySource: 'none' };
const INITIAL_SHOPPING = { clothingItems: 0, electronicsItems: 0 };

/**
 * @returns {{
 *   transport, diet, energy, shopping,
 *   setTransport, setDiet, setEnergy, setShopping,
 *   inputs, total, breakdown, gradeInfo,
 *   resetAll
 * }}
 */
export function useFootprint() {
  const [transport, setTransport] = useState(INITIAL_TRANSPORT);
  const [diet, setDiet] = useState(INITIAL_DIET);
  const [energy, setEnergy] = useState(INITIAL_ENERGY);
  const [shopping, setShopping] = useState(INITIAL_SHOPPING);

  /** Flat merged inputs object — stable reference when nothing changes */
  const inputs = useMemo(
    () => ({ ...transport, ...diet, ...energy, ...shopping }),
    [transport, diet, energy, shopping],
  );

  /** Live total — only recalculates when inputs change (O(1) formula) */
  const total = useMemo(() => calculateMonthlyFootprint(inputs), [inputs]);

  /** Per-category breakdown — isolated calculations */
  const breakdown = useMemo(() => calculateBreakdown(inputs), [inputs]);

  /** Grade metadata derived from total */
  const gradeInfo = useMemo(() => gradeFootprint(total), [total]);

  /** Reset all survey fields back to defaults */
  const resetAll = useCallback(() => {
    setTransport(INITIAL_TRANSPORT);
    setDiet(INITIAL_DIET);
    setEnergy(INITIAL_ENERGY);
    setShopping(INITIAL_SHOPPING);
  }, []);

  return {
    transport,
    diet,
    energy,
    shopping,
    setTransport,
    setDiet,
    setEnergy,
    setShopping,
    inputs,
    total,
    breakdown,
    gradeInfo,
    resetAll,
  };
}
