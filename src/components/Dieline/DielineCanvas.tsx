import { forwardRef } from 'react';
import type { DieleineLayout, PanelRect } from '../../utils/geometry';
import { PX_PER_MM } from '../../utils/geometry';
import type { PanelTheme } from '../../hooks/usePanelThemes';
import type { DocOptions } from '../../utils/exportSVG';

interface Props {
  layout: DieleineLayout;
  themes: Record<string, PanelTheme>;
  selectedPanel: string | null;
  onSelectPanel: (id: string) => void;
  docOpts: DocOptions;
  showLabels?: boolean;
  showBleed?: boolean;
}

const CUT_COLOR = '#FF1493';
const CUT_WIDTH = 2;
const SEL_COLOR = '#FF6B6B';
const BLEED_COLOR = '#aaa';
const BLEED_PX = 3 * PX_PER_MM;

const DielineCanvas = forwardRef<SVGSVGElement, Props>(
  ({ layout, themes, selectedPanel, onSelectPanel, docOpts, showLabels = true, showBleed = false }, ref) => {
    const { svgWidth, svgHeight, panels, foldLines } = layout;
    const margin = docOpts.margin;

    const foldDash = docOpts.perforateFolds
      ? `${docOpts.perforationLength},${docOpts.perforationGap}`
      : '5,3';

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${svgWidth + margin * 2} ${svgHeight + margin * 2}`}
        width={svgWidth + margin * 2}
        height={svgHeight + margin * 2}
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: '#fff', display: 'block', borderRadius: 4 }}
      >
        {/* Image pattern defs */}
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
                <rect x={0} y={0} width={p.w} height={p.h} fill={t.color ?? '#ffffff'} />
                <image
                  href={t.imageUrl}
                  x={0} y={0} width={p.w} height={p.h}
                  preserveAspectRatio="xMidYMid meet"
                />
              </pattern>
            );
          })}
        </defs>

        <g transform={`translate(${margin}, ${margin})`}>
          {/* Bleed guides */}
          {showBleed && panels.map(p => (
            <rect
              key={`bleed-${p.id}`}
              x={p.x - BLEED_PX} y={p.y - BLEED_PX}
              width={p.w + BLEED_PX * 2} height={p.h + BLEED_PX * 2}
              fill="none"
              stroke={BLEED_COLOR}
              strokeWidth={1}
              strokeDasharray="3,3"
              rx={(p.rx ?? 0) + BLEED_PX}
            />
          ))}

          {/* Panels */}
          {panels.map(p => (
            <PanelShape
              key={p.id}
              p={p}
              theme={themes[p.id]}
              selected={p.id === selectedPanel}
              onSelect={onSelectPanel}
              showLabels={showLabels}
              foldDash={foldDash}
            />
          ))}

          {/* Fold lines */}
          {foldLines.map((fl, i) => (
            <line
              key={i}
              x1={fl.x1} y1={fl.y1} x2={fl.x2} y2={fl.y2}
              stroke="#00BFFF"
              strokeWidth={1}
              strokeDasharray={foldDash}
            />
          ))}
        </g>
      </svg>
    );
  },
);

// ---------------------------------------------------------------------------
// Panel sub-component — renders fill + image + outline + label for one panel
// ---------------------------------------------------------------------------

interface PanelProps {
  p: PanelRect;
  theme: PanelTheme | undefined;
  selected: boolean;
  onSelect: (id: string) => void;
  showLabels: boolean;
  foldDash: string;
}

function PanelShape({ p, theme, selected, onSelect, showLabels }: PanelProps) {
  const fill   = theme?.color ?? '#a8d5dc';
  const stroke = selected ? SEL_COLOR : CUT_COLOR;
  const sw     = selected ? CUT_WIDTH + 1 : CUT_WIDTH;
  const fontSize = Math.max(8, Math.min(p.w, p.h) * 0.11);

  const shapeProps = p.path
    ? { d: p.path }
    : { x: p.x, y: p.y, width: p.w, height: p.h, rx: p.rx ?? 0 };

  return (
    <g onClick={() => onSelect(p.id)} style={{ cursor: 'pointer' }}>
      {/* Colour fill */}
      {p.path
        ? <path {...(shapeProps as React.SVGProps<SVGPathElement>)} fill={fill} fillRule="evenodd" stroke="none" />
        : <rect {...(shapeProps as React.SVGProps<SVGRectElement>)} fill={fill} stroke="none" />
      }

      {/* Image fill */}
      {theme?.imageUrl && (
        p.path
          ? <path {...(shapeProps as React.SVGProps<SVGPathElement>)} fill={`url(#pat-${p.id})`} fillRule="evenodd" stroke="none" />
          : <rect {...(shapeProps as React.SVGProps<SVGRectElement>)} fill={`url(#pat-${p.id})`} stroke="none" />
      )}

      {/* Cut outline */}
      {p.path
        ? <path {...(shapeProps as React.SVGProps<SVGPathElement>)} fill="none" stroke={stroke} strokeWidth={sw} style={{ transition: 'stroke 0.15s' }} />
        : <rect {...(shapeProps as React.SVGProps<SVGRectElement>)} fill="none" stroke={stroke} strokeWidth={sw} style={{ transition: 'stroke 0.15s' }} />
      }

      {/* Area label */}
      {showLabels && (
        <text
          x={p.x + p.w / 2} y={p.y + p.h / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={fontSize} fill="rgba(0,0,0,0.32)"
          pointerEvents="none" fontFamily="system-ui, sans-serif" fontWeight="500"
        >
          {p.label}
        </text>
      )}
    </g>
  );
}

DielineCanvas.displayName = 'DielineCanvas';
export default DielineCanvas;
