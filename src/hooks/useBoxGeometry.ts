import { useMemo } from 'react';
import { computeLayout } from '../utils/geometry';
import type { BoxDimensions, DieleineLayout, BoxType } from '../utils/geometry';

export function useBoxGeometry(dims: BoxDimensions, boxType: BoxType = 'reverse-tuck'): DieleineLayout {
  return useMemo(() => computeLayout(dims, boxType), [dims, boxType]);
}
