export type Unit = 'mm' | 'cm' | 'inch' | 'px';

export interface BoxDimensions {
  length: number;
  width: number;
  height: number;
  thumbHoleDiameter: number;
  tuckFlapSize: number;
  glueFlapSize: number;
  glueFlapAngle: number;
  materialThickness: number;
  roundedCornersRadius: number;
  unit: Unit;
  ppi: number;
}

const MM_PER_UNIT: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  inch: 25.4,
  px: 1 / 3.7795275591,
};

export const PX_PER_MM = 3.7795275591;

export function convertUnit(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const mm = value * MM_PER_UNIT[from];
  return mm / MM_PER_UNIT[to];
}

export function convertDimensions(dims: BoxDimensions, newUnit: Unit): BoxDimensions {
  const DIMENSIONAL_KEYS: (keyof BoxDimensions)[] = [
    'length', 'width', 'height',
    'thumbHoleDiameter', 'tuckFlapSize', 'glueFlapSize',
    'materialThickness', 'roundedCornersRadius',
  ];
  const decimals = newUnit === 'mm' ? 1 : newUnit === 'cm' ? 2 : newUnit === 'inch' ? 3 : 0;
  const factor = MM_PER_UNIT[dims.unit] / MM_PER_UNIT[newUnit];
  const result = { ...dims, unit: newUnit } as BoxDimensions;
  for (const key of DIMENSIONAL_KEYS) {
    const raw = (dims[key] as number) * factor;
    (result as unknown as Record<string, number>)[key] = parseFloat(raw.toFixed(decimals));
  }
  return result;
}

export const DEFAULT_DIMS: BoxDimensions = {
  length: 6,
  width: 3,
  height: 9,
  thumbHoleDiameter: 1,
  tuckFlapSize: 2,
  glueFlapSize: 1.5,
  glueFlapAngle: 80,
  materialThickness: 0.05,
  roundedCornersRadius: 0.5,
  unit: 'cm',
  ppi: 72,
};

export function toPx(value: number, unit: Unit, _ppi = 72): number {
  switch (unit) {
    case 'cm':   return value * 10 * PX_PER_MM;
    case 'inch': return value * 25.4 * PX_PER_MM;
    case 'px':   return value;
    default:     return value * PX_PER_MM;
  }
}

export function pxToMm(px: number): number {
  return px / PX_PER_MM;
}

export interface DieleineLayout {
  svgWidth: number;
  svgHeight: number;
  panels: PanelRect[];
  foldLines: Line[];
}

export interface PanelRect {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  path?: string;
  rx?: number;
}

export interface Line {
  x1: number; y1: number; x2: number; y2: number; type: 'fold' | 'cut';
}

export function computeLayout(d: BoxDimensions): DieleineLayout {
  const pad    = 24;
  const L      = toPx(d.length, d.unit);
  const W      = toPx(d.width, d.unit);
  const H      = toPx(d.height, d.unit);
  const tuck   = toPx(d.tuckFlapSize, d.unit);
  const glueW  = toPx(d.glueFlapSize, d.unit);
  const lidH   = tuck * 1.8;                         // tall rounded lid
  const dustH  = tuck * 0.9;                         // trapezoidal dust flap
  const notchR = Math.min(toPx(d.thumbHoleDiameter / 2, d.unit), L * 0.12, tuck * 0.6);

  // Columns: Glue | Front(A,L) | LeftSide(B,W) | Back(C,L) | RightSide(D,W)
  const col0 = pad;
  const col1 = col0 + glueW;   // Front (A) — main, width L
  const col2 = col1 + L;       // Left Side (B) — side, width W
  const col3 = col2 + W;       // Back (C) — main, width L
  const col4 = col3 + L;       // Right Side (D) — side, width W
  const end  = col4 + W;

  const row0 = pad;
  const row1 = row0 + lidH;    // top body fold line
  const row2 = row1 + H;       // bottom body fold line

  const svgWidth  = end + pad;
  const svgHeight = row2 + lidH + pad;

  // Glue flap — pure trapezoid (fold edge full height, outer edge shorter, angled sides)
  const gy = H * 0.16;              // vertical inset of the outer edge
  const gluePath = [
    `M ${col1},${row1}`,              // top-right (fold, full height)
    `L ${col0},${row1 + gy}`,         // angled side up to outer top
    `L ${col0},${row2 - gy}`,         // short outer (left) edge
    `L ${col1},${row2}`,              // angled side to bottom-right
    'Z',
  ].join(' ');

  const panels: PanelRect[] = [
    // Glue flap
    { id: 'glue-flap', label: 'Glue Flap', x: col0, y: row1, w: glueW, h: H, path: gluePath },

    // Body panels — Front & Back carry thumb-notches on their free edges
    { id: 'front',      label: 'Front',      x: col1, y: row1, w: L, h: H },
    { id: 'left-side',  label: 'Left Side',  x: col2, y: row1, w: W, h: H },
    { id: 'back',       label: 'Back',       x: col3, y: row1, w: L, h: H, path: notchedPanelPath(col3, row1, L, H, notchR, 'top') },
    { id: 'right-side', label: 'Right Side', x: col4, y: row1, w: W, h: H },

    // Large tuck lids — diagonal: top of Front, bottom of Back
    { id: 'tuck-flap-front',  label: 'Tuck Flap (Front)', x: col1, y: row1 - lidH, w: L, h: lidH, path: lidPath(col1, row1 - lidH, L, lidH, false) },
    { id: 'bottom-tuck-back', label: 'Bottom Tuck (Back)', x: col3, y: row2, w: L, h: lidH, path: lidPath(col3, row2, L, lidH, true) },

    // Dust flaps — both side panels, top & bottom
    { id: 'dust-flap-left',    label: 'Dust Flap (Left)',   x: col2, y: row1 - dustH, w: W, h: dustH, path: dustPath(col2, row1 - dustH, W, dustH, false) },
    { id: 'dust-flap-right',   label: 'Dust Flap (Right)',  x: col4, y: row1 - dustH, w: W, h: dustH, path: dustPath(col4, row1 - dustH, W, dustH, false) },
    { id: 'bottom-dust-left',  label: 'Bottom Dust (Left)', x: col2, y: row2, w: W, h: dustH, path: dustPath(col2, row2, W, dustH, true) },
    { id: 'bottom-dust-right', label: 'Bottom Dust (Right)', x: col4, y: row2, w: W, h: dustH, path: dustPath(col4, row2, W, dustH, true) },
  ];

  const foldLines: Line[] = [
    // Vertical folds between panels
    { x1: col1, y1: row1, x2: col1, y2: row2, type: 'fold' },
    { x1: col2, y1: row1, x2: col2, y2: row2, type: 'fold' },
    { x1: col3, y1: row1, x2: col3, y2: row2, type: 'fold' },
    { x1: col4, y1: row1, x2: col4, y2: row2, type: 'fold' },
    // Horizontal body folds
    { x1: col1, y1: row1, x2: end, y2: row1, type: 'fold' },
    { x1: col1, y1: row2, x2: end, y2: row2, type: 'fold' },
    // Internal lid folds (divide tuck-base panel from rounded tuck-in flap)
    { x1: col1, y1: row1 - tuck, x2: col2, y2: row1 - tuck, type: 'fold' },
    { x1: col3, y1: row2 + tuck, x2: col4, y2: row2 + tuck, type: 'fold' },
  ];

  return { svgWidth, svgHeight, panels, foldLines };
}

/** Tall rounded tuck lid. Base sits on the fold line; free edge has rounded corners. */
function lidPath(
  x: number, y: number, w: number, h: number, flip: boolean,
): string {
  const ni = 0;                                     // no inset — lid matches panel width
  const r  = Math.min((w - 2 * ni) * 0.5, h * 0.42); // top corner radius

  if (!flip) {
    // Base at bottom (y+h), rounded top at y
    return [
      `M ${x + ni},${y + h}`,
      `L ${x + ni},${y + r}`,
      `A ${r},${r} 0 0 1 ${x + ni + r},${y}`,
      `L ${x + w - ni - r},${y}`,
      `A ${r},${r} 0 0 1 ${x + w - ni},${y + r}`,
      `L ${x + w - ni},${y + h}`,
      'Z',
    ].join(' ');
  } else {
    // Base at top (y), rounded bottom at y+h
    return [
      `M ${x + ni},${y}`,
      `L ${x + ni},${y + h - r}`,
      `A ${r},${r} 0 0 0 ${x + ni + r},${y + h}`,
      `L ${x + w - ni - r},${y + h}`,
      `A ${r},${r} 0 0 0 ${x + w - ni},${y + h - r}`,
      `L ${x + w - ni},${y}`,
      'Z',
    ].join(' ');
  }
}

/** Body panel rectangle with a concave semicircle thumb-notch on one edge. */
function notchedPanelPath(
  x: number, y: number, w: number, h: number, notchR: number, edge: 'top' | 'bottom',
): string {
  const cx = x + w / 2;
  if (notchR < 1) {
    return [`M ${x},${y}`, `L ${x + w},${y}`, `L ${x + w},${y + h}`, `L ${x},${y + h}`, 'Z'].join(' ');
  }
  if (edge === 'bottom') {
    // Notch dips UP into the panel on the bottom edge
    return [
      `M ${x},${y}`,
      `L ${x + w},${y}`,
      `L ${x + w},${y + h}`,
      `L ${cx + notchR},${y + h}`,
      `A ${notchR},${notchR} 0 0 0 ${cx - notchR},${y + h}`,
      `L ${x},${y + h}`,
      'Z',
    ].join(' ');
  } else {
    // Notch dips DOWN into the panel on the top edge
    return [
      `M ${x},${y}`,
      `L ${cx - notchR},${y}`,
      `A ${notchR},${notchR} 0 0 0 ${cx + notchR},${y}`,
      `L ${x + w},${y}`,
      `L ${x + w},${y + h}`,
      `L ${x},${y + h}`,
      'Z',
    ].join(' ');
  }
}

/** Pure trapezoid dust flap: wide base corners angle straight up to a short flat top. */
function dustPath(
  x: number, y: number, w: number, h: number, flip: boolean,
): string {
  const inset = w * 0.18;   // horizontal inset of each angled side at the top

  if (!flip) {
    // base at bottom (y+h), short top at y
    return [
      `M ${x},${y + h}`,             // bottom-left (wide base corner at front/back edge)
      `L ${x + inset},${y}`,         // angled side up to top-left
      `L ${x + w - inset},${y}`,     // short horizontal top
      `L ${x + w},${y + h}`,         // angled side down to bottom-right (wide base corner)
      'Z',
    ].join(' ');
  } else {
    // base at top (y), short edge at y+h (mirror)
    return [
      `M ${x},${y}`,
      `L ${x + inset},${y + h}`,
      `L ${x + w - inset},${y + h}`,
      `L ${x + w},${y}`,
      'Z',
    ].join(' ');
  }
}
