export type Unit = 'mm' | 'cm' | 'inch';

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
}

export const DEFAULT_DIMS: BoxDimensions = {
  length: 60,
  width: 30,
  height: 90,
  thumbHoleDiameter: 10,
  tuckFlapSize: 20,
  glueFlapSize: 15,
  glueFlapAngle: 80,
  materialThickness: 0.5,
  roundedCornersRadius: 15,
  unit: 'mm',
};

const PX_PER_MM = 3.7795275591;

export function toPx(value: number, unit: Unit): number {
  switch (unit) {
    case 'cm': return value * 10 * PX_PER_MM;
    case 'inch': return value * 25.4 * PX_PER_MM;
    default: return value * PX_PER_MM;
  }
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
  const pad = 20;
  const L = toPx(d.length, d.unit);
  const W = toPx(d.width, d.unit);
  const H = toPx(d.height, d.unit);
  const tuck = toPx(d.tuckFlapSize, d.unit);
  const glueW = toPx(d.glueFlapSize, d.unit);
  const rx = toPx(Math.min(d.roundedCornersRadius, d.length / 2, d.width / 2), d.unit);
  const thumbR = toPx(d.thumbHoleDiameter / 2, d.unit);
  const angleRad = (d.glueFlapAngle * Math.PI) / 180;
  const dustH = toPx(d.width / 2, d.unit);

  // Layout columns: GlueFlap | LeftSide | Front | RightSide | Back
  // Rows: TuckFlap | Main panels | BottomFlap

  const col0x = pad;
  const col1x = col0x + glueW;
  const col2x = col1x + W;
  const col3x = col2x + L;
  const col4x = col3x + W;

  const row0y = pad + tuck;
  const row1y = row0y + tuck; // main panels start
  const row2y = row1y + H;   // bottom tuck start

  const svgWidth = col4x + L + pad;
  const svgHeight = row2y + tuck + pad;

  // Glue flap as parallelogram
  const glueDx = Math.tan(Math.PI / 2 - angleRad) * H;
  const gluePath = `
    M ${col0x + glueDx},${row1y}
    L ${col1x},${row1y}
    L ${col1x},${row2y}
    L ${col0x},${row2y}
    Z
  `.trim();

  const panels: PanelRect[] = [
    {
      id: 'glue-flap',
      label: 'Glue Flap',
      x: col0x, y: row1y, w: glueW, h: H,
      path: gluePath,
    },
    { id: 'left-side', label: 'Left Side', x: col1x, y: row1y, w: W, h: H, rx },
    { id: 'front', label: 'Front', x: col2x, y: row1y, w: L, h: H, rx },
    { id: 'right-side', label: 'Right Side', x: col3x, y: row1y, w: W, h: H, rx },
    { id: 'back', label: 'Back', x: col4x, y: row1y, w: L, h: H, rx },
    // Tuck flaps (top)
    {
      id: 'tuck-flap-front',
      label: 'Tuck Flap (Front)',
      x: col2x, y: row0y, w: L, h: tuck,
      path: tuckFlapPath(col2x, row0y, L, tuck, thumbR, rx, true),
    },
    {
      id: 'tuck-flap-back',
      label: 'Tuck Flap (Back)',
      x: col4x, y: row0y, w: L, h: tuck,
      path: tuckFlapPath(col4x, row0y, L, tuck, thumbR, rx, false),
    },
    // Dust flaps (top)
    { id: 'dust-flap-left', label: 'Dust Flap (Left)', x: col1x, y: row0y, w: W, h: dustH, rx: rx / 2 },
    { id: 'dust-flap-right', label: 'Dust Flap (Right)', x: col3x, y: row0y, w: W, h: dustH, rx: rx / 2 },
    // Bottom flaps
    {
      id: 'bottom-tuck-front',
      label: 'Bottom Tuck (Front)',
      x: col2x, y: row2y, w: L, h: tuck, rx: rx / 2,
    },
    {
      id: 'bottom-tuck-back',
      label: 'Bottom Tuck (Back)',
      x: col4x, y: row2y, w: L, h: tuck, rx: rx / 2,
    },
    { id: 'bottom-dust-left', label: 'Bottom Dust (Left)', x: col1x, y: row2y, w: W, h: dustH, rx: rx / 2 },
    { id: 'bottom-dust-right', label: 'Bottom Dust (Right)', x: col3x, y: row2y, w: W, h: dustH, rx: rx / 2 },
  ];

  const foldLines: Line[] = [
    { x1: col1x, y1: pad, x2: col1x, y2: svgHeight - pad, type: 'fold' },
    { x1: col2x, y1: pad, x2: col2x, y2: svgHeight - pad, type: 'fold' },
    { x1: col3x, y1: pad, x2: col3x, y2: svgHeight - pad, type: 'fold' },
    { x1: col4x, y1: pad, x2: col4x, y2: svgHeight - pad, type: 'fold' },
    { x1: col1x, y1: row1y, x2: col4x + L, y2: row1y, type: 'fold' },
    { x1: col1x, y1: row2y, x2: col4x + L, y2: row2y, type: 'fold' },
  ];

  return { svgWidth, svgHeight, panels, foldLines };
}

function tuckFlapPath(
  x: number, y: number, w: number, h: number,
  thumbR: number, rx: number, withThumb: boolean
): string {
  const cr = Math.min(rx / 2, h / 2, w / 2);
  const cx = x + w / 2;
  const ty = y; // top y

  if (withThumb && thumbR > 0 && thumbR < w / 2) {
    return `
      M ${x + cr},${ty + h}
      L ${cx - thumbR},${ty + h}
      A ${thumbR},${thumbR} 0 0 0 ${cx + thumbR},${ty + h}
      L ${x + w - cr},${ty + h}
      Q ${x + w},${ty + h} ${x + w},${ty + h - cr}
      L ${x + w},${ty + cr}
      Q ${x + w},${ty} ${x + w - cr},${ty}
      L ${x + cr},${ty}
      Q ${x},${ty} ${x},${ty + cr}
      L ${x},${ty + h - cr}
      Q ${x},${ty + h} ${x + cr},${ty + h}
      Z
    `.trim();
  }

  return `
    M ${x},${ty + h} L ${x + w},${ty + h}
    L ${x + w},${ty + cr}
    Q ${x + w},${ty} ${x + w - cr},${ty}
    L ${x + cr},${ty}
    Q ${x},${ty} ${x},${ty + cr}
    Z
  `.trim();
}
