import { forwardRef } from 'react';
import type { DieleineLayout, PanelRect } from '../../utils/geometry';
import type { PanelTheme } from '../../hooks/usePanelThemes';
import type { DocOptions } from '../../utils/exportSVG';

interface Props {
  layout: DieleineLayout;
  themes: Record<string, PanelTheme>;
  selectedPanel: string | null;
  onSelectPanel: (id: string) => void;
  docOpts: DocOptions;
}

const STROKE = '#2a6a80';
const STROKE_WIDTH = 1.2;

const DielineCanvas = forwardRef<SVGSVGElement, Props>(
  ({ layout, themes, selectedPanel, onSelectPanel, docOpts }, ref) => {
    const { svgWidth, svgHeight, panels, foldLines } = layout;
    const margin = docOpts.margin;

    const foldDash = docOpts.perforateFolds
      ? `${docOpts.perforationLength},${docOpts.perforationGap}`
      : '6,4';

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${svgWidth + margin * 2} ${svgHeight + margin * 2}`}
        width={svgWidth + margin * 2}
        height={svgHeight + margin * 2}
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: '#fff', display: 'block' }}
      >
        <defs>
          {panels.map(p => {
            const t = themes[p.id];
            if (!t?.imageUrl) return null;
            return (
              <pattern
                key={`pat-${p.id}`}
                id={`pat-${p.id}`}
                patternUnits="userSpaceOnUse"
                x={margin + p.x}
                y={margin + p.y}
                width={p.w}
                height={p.h}
              >
                <image href={t.imageUrl} x={0} y={0} width={p.w} height={p.h} preserveAspectRatio="xMidYMid slice" />
              </pattern>
            );
          })}
        </defs>

        <g transform={`translate(${margin}, ${margin})`}>
          {/* Panel fills */}
          {panels.map(p => renderPanel(p, themes[p.id], selectedPanel === p.id, onSelectPanel))}

          {/* Fold lines */}
          {foldLines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH * 0.7}
              strokeDasharray={foldDash}
              opacity={0.6}
              pointerEvents="none"
            />
          ))}
        </g>
      </svg>
    );
  }
);

function renderPanel(
  p: PanelRect,
  theme: PanelTheme | undefined,
  selected: boolean,
  onSelect: (id: string) => void
) {
  const fill = theme?.imageUrl ? `url(#pat-${p.id})` : (theme?.color ?? '#a8d5dc');
  const selStroke = selected ? '#ff6b35' : STROKE;
  const selWidth = selected ? 2.5 : STROKE_WIDTH;

  const shared = {
    fill,
    stroke: selStroke,
    strokeWidth: selWidth,
    cursor: 'pointer',
    onClick: () => onSelect(p.id),
    style: { transition: 'stroke 0.15s' },
  };

  if (p.path) {
    return <path key={p.id} d={p.path} {...shared} />;
  }

  return (
    <rect
      key={p.id}
      x={p.x} y={p.y}
      width={p.w} height={p.h}
      rx={p.rx ?? 0}
      {...shared}
    />
  );
}

DielineCanvas.displayName = 'DielineCanvas';
export default DielineCanvas;
