import { CRIME_COLORS } from "../constants/crimeTypeColors";
import type { crimeType } from "../types/crime";

export const getCrimeColor = (crimeType: crimeType): string => {
  return CRIME_COLORS[crimeType];
};
