import { useMemo } from 'react';
import { computeLayout } from '../utils/geometry';
import type { BoxDimensions, DieleineLayout } from '../utils/geometry';

export function useBoxGeometry(dims: BoxDimensions): DieleineLayout {
  return useMemo(() => computeLayout(dims), [
    dims.length, dims.width, dims.height,
    dims.thumbHoleDiameter, dims.tuckFlapSize, dims.glueFlapSize,
    dims.glueFlapAngle, dims.materialThickness, dims.roundedCornersRadius,
    dims.unit,
  ]);
}
