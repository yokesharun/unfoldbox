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

// How many mm = 1 of each unit
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

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function computeLayout(d: BoxDimensions): DieleineLayout {
  const pad    = 24;
  const L      = toPx(d.length, d.unit);
  const W      = toPx(d.width, d.unit);
  const H      = toPx(d.height, d.unit);
  const tuck   = toPx(d.tuckFlapSize, d.unit);
  const glueW  = toPx(d.glueFlapSize, d.unit);
  const thumbR = toPx(d.thumbHoleDiameter / 2, d.unit);
  const dustH  = tuck * 0.75;  // dust flap = 75% of tuck height

  // Column x-positions: [GlueFlap][Front][LeftSide][RightSide][Back]
  const col0 = pad;
  const col1 = col0 + glueW;
  const col2 = col1 + L;
  const col3 = col2 + W;
  const col4 = col3 + W;

  // Row y-positions
  const row0 = pad;
  const row1 = row0 + tuck;
  const row2 = row1 + H;

  const svgWidth  = col4 + L + pad;
  const svgHeight = row2 + tuck + pad;

  // Glue flap parallelogram
  const glueDx   = Math.tan(Math.PI / 2 - (d.glueFlapAngle * Math.PI / 180)) * H;
  const gluePath  = [
    `M ${col0 + glueDx},${row1}`,
    `L ${col1},${row1}`,
    `L ${col1},${row2}`,
    `L ${col0},${row2}`,
    'Z',
  ].join(' ');

  const panels: PanelRect[] = [
    // Glue flap
    { id: 'glue-flap',      label: 'Glue Flap',         x: col0, y: row1, w: glueW, h: H,      path: gluePath },
    // Main body panels
    { id: 'front',           label: 'Front',              x: col1, y: row1, w: L,     h: H },
    { id: 'left-side',       label: 'Left Side',          x: col2, y: row1, w: W,     h: H },
    { id: 'right-side',      label: 'Right Side',         x: col3, y: row1, w: W,     h: H },
    { id: 'back',            label: 'Back',               x: col4, y: row1, w: L,     h: H },
    // Top tuck flaps
    { id: 'tuck-flap-front', label: 'Tuck Flap (Front)', x: col1, y: row0, w: L,     h: tuck,  path: tuckPath(col1, row0, L, tuck, thumbR, true) },
    { id: 'tuck-flap-back',  label: 'Tuck Flap (Back)',  x: col4, y: row0, w: L,     h: tuck,  path: tuckPath(col4, row0, L, tuck, thumbR, false) },
    // Top dust flaps (attached to side panels, free edge faces up)
    { id: 'dust-flap-left',  label: 'Dust Flap (Left)',  x: col2, y: row1 - dustH, w: W, h: dustH, path: dustPath(col2, row1 - dustH, W, dustH, false) },
    { id: 'dust-flap-right', label: 'Dust Flap (Right)', x: col3, y: row1 - dustH, w: W, h: dustH, path: dustPath(col3, row1 - dustH, W, dustH, false) },
    // Bottom tuck flaps
    { id: 'bottom-tuck-front', label: 'Bottom Tuck (Front)', x: col1, y: row2, w: L, h: tuck, path: bottomTuckPath(col1, row2, L, tuck) },
    { id: 'bottom-tuck-back',  label: 'Bottom Tuck (Back)',  x: col4, y: row2, w: L, h: tuck, path: bottomTuckPath(col4, row2, L, tuck) },
    // Bottom dust flaps (free edge faces down)
    { id: 'bottom-dust-left',  label: 'Bottom Dust (Left)',  x: col2, y: row2, w: W, h: dustH, path: dustPath(col2, row2, W, dustH, true) },
    { id: 'bottom-dust-right', label: 'Bottom Dust (Right)', x: col3, y: row2, w: W, h: dustH, path: dustPath(col3, row2, W, dustH, true) },
  ];

  const foldLines: Line[] = [
    // Vertical fold lines at each column boundary
    { x1: col1, y1: pad, x2: col1, y2: svgHeight - pad, type: 'fold' },
    { x1: col2, y1: pad, x2: col2, y2: svgHeight - pad, type: 'fold' },
    { x1: col3, y1: pad, x2: col3, y2: svgHeight - pad, type: 'fold' },
    { x1: col4, y1: pad, x2: col4, y2: svgHeight - pad, type: 'fold' },
    // Horizontal fold lines at top and bottom of main body
    { x1: col1, y1: row1, x2: col4 + L, y2: row1, type: 'fold' },
    { x1: col1, y1: row2, x2: col4 + L, y2: row2, type: 'fold' },
  ];

  return { svgWidth, svgHeight, panels, foldLines };
}

// ---------------------------------------------------------------------------
// Path generators
// ---------------------------------------------------------------------------

/**
 * Top tuck insert for reverse-tuck-end box.
 *
 * Structure (base at bottom, free edge at top):
 *   [BASE] full width, small chamfered bottom corners
 *   [VERTICAL SIDES] straight up from base to shoulder
 *   [HORIZONTAL STEP] right-angle inward cut at shoulder
 *   [NECK] short vertical column
 *   [DOME] wide elliptical arc at top. Optional thumb notch.
 */
function tuckPath(
  x: number, y: number, w: number, h: number,
  thumbR: number, withThumb: boolean,
): string {
  const C  = Math.min(w * 0.05, h * 0.08);   // small base corner chamfer
  const SI = w * 0.14;                         // shoulder inset each side → inner = 72% of w
  const SY = y + h * 0.52;                    // step Y: 52% from top
  const DY = y + h * 0.42;                    // dome base Y: 42% from top (10% neck column)
  const RX = (w - 2 * SI) / 2;               // dome x-radius = w × 0.36
  const RY = DY - y;                           // dome y-radius = h × 0.42
  const CX = x + w / 2;
  const TR = withThumb ? Math.min(thumbR, RX * 0.32, h * 0.10) : 0;

  const dome = (withThumb && TR > 1)
    ? [
        `A ${RX},${RY} 0 0 0 ${CX + TR},${y}`,   // right shoulder → right of notch
        `A ${TR},${TR} 0 0 1 ${CX - TR},${y}`,    // concave thumb notch
        `A ${RX},${RY} 0 0 0 ${x + SI},${DY}`,    // left of notch → left shoulder
      ].join(' ')
    : `A ${RX},${RY} 0 0 0 ${x + SI},${DY}`;

  return [
    `M ${x + C},${y + h}`,           // base-left
    `L ${x + w - C},${y + h}`,       // base-right
    `L ${x + w},${y + h - C}`,       // chamfer corner bottom-right
    `L ${x + w},${SY}`,               // VERTICAL right side (straight up)
    `L ${x + w - SI},${SY}`,          // HORIZONTAL STEP inward right
    `L ${x + w - SI},${DY}`,          // neck up to dome base
    dome,
    `L ${x + SI},${SY}`,              // neck down to step
    `L ${x},${SY}`,                   // STEP OUTWARD left
    `L ${x},${y + h - C}`,            // VERTICAL left side (straight down)
    'Z',                               // closes chamfer corner bottom-left
  ].join(' ');
}

/**
 * Dust flap for side panels — tapered trapezoid.
 *
 * Full width at the fold (base). Sides angle DIAGONALLY inward toward a narrower
 * free edge. Small chamfer cuts only at the free-edge corners.
 *
 * flip=false → base at bottom (top dust flaps, free edge faces up)
 * flip=true  → base at top   (bottom dust flaps, free edge faces down)
 */
function dustPath(
  x: number, y: number, w: number, h: number, flip: boolean,
): string {
  const inset = w * 0.18;                      // diagonal taper per side
  const C     = Math.min(w * 0.05, h * 0.15); // small chamfer at free-edge corners only

  if (!flip) {
    // Base at BOTTOM, free edge at TOP — sides angle inward going up
    return [
      `M ${x},${y + h}`,              // base-left  (full width)
      `L ${x + w},${y + h}`,          // base-right
      `L ${x + w - inset},${y + C}`,  // diagonal right side to near top-right
      `L ${x + w - inset - C},${y}`,  // chamfer top-right corner
      `L ${x + inset + C},${y}`,      // free edge (horizontal, narrow)
      `L ${x + inset},${y + C}`,      // chamfer top-left corner
      'Z',                             // closes: diagonal left side
    ].join(' ');
  } else {
    // Base at TOP, free edge at BOTTOM — sides angle inward going down
    return [
      `M ${x},${y}`,                  // base-left  (full width)
      `L ${x + w},${y}`,              // base-right
      `L ${x + w - inset},${y + h - C}`,  // diagonal right side to near bottom-right
      `L ${x + w - inset - C},${y + h}`,  // chamfer bottom-right corner
      `L ${x + inset + C},${y + h}`,      // free edge (horizontal, narrow)
      `L ${x + inset},${y + h - C}`,      // chamfer bottom-left corner
      'Z',
    ].join(' ');
  }
}

/**
 * Bottom tuck flap — mirror of top tuck but with U-scallop at free edge.
 *
 * Base at top (fold line). Free edge at bottom with concave U-scallop.
 * Same right-angle shoulder step structure as tuckPath.
 */
/**
 * Bottom tuck flap — mirror of tuckPath with U-scallop at free edge.
 *
 * Base at top (fold line). Vertical sides going DOWN to shoulder step.
 * Right-angle step inward. Short neck. Concave U-scallop at free edge.
 */
function bottomTuckPath(
  x: number, y: number, w: number, h: number,
): string {
  const C   = Math.min(w * 0.05, h * 0.08);  // base corner chamfer
  const SI  = w * 0.14;                        // shoulder inset each side (matches tuckPath)
  const SY  = y + h * 0.48;                   // step Y: 48% from top
  const SCY = y + h * 0.58;                   // scallop top: 58% from top (10% neck below step)
  const RX  = (w - 2 * SI) / 2;              // scallop x-radius = w × 0.36
  const RY  = (y + h) - SCY;                  // scallop depth reaches free edge

  return [
    `M ${x + C},${y}`,                // base-left
    `L ${x + w - C},${y}`,            // base-right
    `L ${x + w},${y + C}`,             // chamfer corner top-right
    `L ${x + w},${SY}`,                // VERTICAL right side (straight down)
    `L ${x + w - SI},${SY}`,           // HORIZONTAL STEP inward right
    `L ${x + w - SI},${SCY}`,          // neck down to scallop base
    `A ${RX},${RY} 0 0 1 ${x + SI},${SCY}`,  // concave U-scallop (CW)
    `L ${x + SI},${SY}`,               // neck up to step
    `L ${x},${SY}`,                    // STEP OUTWARD left
    `L ${x},${y + C}`,                 // VERTICAL left side (straight up)
    'Z',
  ].join(' ');
}
