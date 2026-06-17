import { useMemo } from 'react';
import { computeLayout, computeDustFlapLayout } from '../utils/geometry';
import type { BoxDimensions, DieleineLayout } from '../utils/geometry';

export function useBoxGeometry(dims: BoxDimensions, boxType = 'reverse-tuck'): DieleineLayout {
  return useMemo(() => {
    if (boxType === 'dust-flap') return computeDustFlapLayout(dims);
    return computeLayout(dims);
  }, [dims, boxType]);
}
