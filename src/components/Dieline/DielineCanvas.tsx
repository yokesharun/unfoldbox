import { forwardRef, useRef } from 'react';
import type { DieleineLayout, PanelRect } from '../../utils/geometry';
import { PX_PER_MM } from '../../utils/geometry';
import type { PanelTheme, ImgTransform } from '../../hooks/usePanelThemes';
import { DEFAULT_IMG } from '../../hooks/usePanelThemes';
import type { DocOptions } from '../../utils/exportSVG';

interface Props {
  layout: DieleineLayout;
  themes: Record<string, PanelTheme>;
  selectedPanel: string | null;
  onSelectPanel: (id: string) => void;
  docOpts: DocOptions;
  showLabels?: boolean;
  showBleed?: boolean;
  zoom?: number;
  onImageTransform?: (id: string, partial: Partial<ImgTransform>) => void;
}

const CUT_COLOR = '#FF1493';
const CUT_WIDTH = 2;
const SEL_COLOR = '#FF6B6B';
const BLEED_COLOR = '#aaa';
const BLEED_PX = 3 * PX_PER_MM;

/** SVG transform that moves/scales/rotates a panel-fitted image about the panel centre. */
function imgTransform(p: PanelRect, t: ImgTransform = DEFAULT_IMG): string {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  return `translate(${t.x} ${t.y}) rotate(${t.rotation} ${cx} ${cy}) translate(${cx} ${cy}) scale(${t.scale}) translate(${-cx} ${-cy})`;
}

const DielineCanvas = forwardRef<SVGSVGElement, Props>(
  ({ layout, themes, selectedPanel, onSelectPanel, docOpts, showLabels = true, showBleed = false, zoom = 1, onImageTransform }, ref) => {
    const { svgWidth, svgHeight, panels, foldLines } = layout;
    const margin = docOpts.margin;
    const gRef = useRef<SVGGElement>(null);

    const foldDash = docOpts.perforateFolds
      ? `${docOpts.perforationLength},${docOpts.perforationGap}`
      : '5,3';

    const selPanel = panels.find(p => p.id === selectedPanel);
    const selTheme = selectedPanel ? themes[selectedPanel] : undefined;

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${svgWidth + margin * 2} ${svgHeight + margin * 2}`}
        width={(svgWidth + margin * 2) * zoom}
        height={(svgHeight + margin * 2) * zoom}
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: '#fff', display: 'block', borderRadius: 4 }}
      >
        {/* Clip paths for image panels */}
        <defs>
          {panels.map(p => {
            const t = themes[p.id];
            if (!t?.imageUrl) return null;
            return (
              <clipPath key={`clip-${p.id}`} id={`clip-${p.id}`} clipPathUnits="userSpaceOnUse">
                {p.path
                  ? <path d={p.path} />
                  : <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx ?? 0} />
                }
              </clipPath>
            );
          })}
        </defs>

        <g ref={gRef} transform={`translate(${margin}, ${margin})`}>
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

          {/* Image edit handles (never exported — class .dieline-editor) */}
          {onImageTransform && selPanel && selTheme?.imageUrl && (
            <ImageEditOverlay
              p={selPanel}
              img={selTheme.img ?? DEFAULT_IMG}
              gRef={gRef}
              onChange={partial => onImageTransform(selPanel.id, partial)}
            />
          )}
        </g>
      </svg>
    );
  },
);

// ---------------------------------------------------------------------------
// Panel sub-component — fill + clipped image + outline + label
// ---------------------------------------------------------------------------

interface PanelProps {
  p: PanelRect;
  theme: PanelTheme | undefined;
  selected: boolean;
  onSelect: (id: string) => void;
  showLabels: boolean;
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

      {/* Image fill — clipped to the panel, transformed (move/scale/rotate) */}
      {theme?.imageUrl && (
        <g clipPath={`url(#clip-${p.id})`}>
          <image
            href={theme.imageUrl}
            x={p.x} y={p.y} width={p.w} height={p.h}
            preserveAspectRatio="xMidYMid meet"
            transform={imgTransform(p, theme.img)}
            style={{ pointerEvents: 'none' }}
          />
        </g>
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

// ---------------------------------------------------------------------------
// Image edit overlay — move / resize / rotate handles for the selected panel
// ---------------------------------------------------------------------------

type DragMode = 'move' | 'scale' | 'rotate';
interface DragState {
  mode: DragMode;
  start: { x: number; y: number };
  startImg: ImgTransform;
  cx: number;
  cy: number;
}

interface OverlayProps {
  p: PanelRect;
  img: ImgTransform;
  gRef: React.RefObject<SVGGElement | null>;
  onChange: (partial: Partial<ImgTransform>) => void;
}

const HANDLE_R = 7;
const ROTATE_OFFSET = 28;

function ImageEditOverlay({ p, img, gRef, onChange }: OverlayProps) {
  const drag = useRef<DragState | null>(null);
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;

  function toUser(e: React.PointerEvent): { x: number; y: number } {
    const g = gRef.current;
    const ctm = g?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }

  function onDown(e: React.PointerEvent<SVGElement>) {
    e.stopPropagation();
    const mode = (e.currentTarget.dataset.mode as DragMode) ?? 'move';
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, start: toUser(e), startImg: { ...img }, cx, cy };
  }

  function onMove(e: React.PointerEvent<SVGElement>) {
    const d = drag.current;
    if (!d) return;
    const cur = toUser(e);
    if (d.mode === 'move') {
      onChange({ x: d.startImg.x + (cur.x - d.start.x), y: d.startImg.y + (cur.y - d.start.y) });
    } else if (d.mode === 'scale') {
      const d0 = Math.hypot(d.start.x - d.cx, d.start.y - d.cy) || 1;
      const d1 = Math.hypot(cur.x - d.cx, cur.y - d.cy);
      const s = Math.min(8, Math.max(0.1, d.startImg.scale * (d1 / d0)));
      onChange({ scale: s });
    } else {
      const a0 = Math.atan2(d.start.y - d.cy, d.start.x - d.cx);
      const a1 = Math.atan2(cur.y - d.cy, cur.x - d.cx);
      onChange({ rotation: d.startImg.rotation + (a1 - a0) * 180 / Math.PI });
    }
  }

  function onUp(e: React.PointerEvent<SVGElement>) {
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  return (
    <g className="dieline-editor">
      {/* edit frame */}
      <rect
        x={p.x} y={p.y} width={p.w} height={p.h}
        fill="none" stroke={SEL_COLOR} strokeWidth={1} strokeDasharray="4,3"
        pointerEvents="none"
      />
      {/* move area */}
      <rect
        data-mode="move"
        x={p.x} y={p.y} width={p.w} height={p.h}
        fill="transparent" style={{ cursor: 'move' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      />
      {/* rotate handle (top-centre) */}
      <line x1={cx} y1={p.y} x2={cx} y2={p.y - ROTATE_OFFSET} stroke={SEL_COLOR} strokeWidth={1} pointerEvents="none" />
      <circle
        data-mode="rotate"
        cx={cx} cy={p.y - ROTATE_OFFSET} r={HANDLE_R}
        fill="#fff" stroke={SEL_COLOR} strokeWidth={1.5} style={{ cursor: 'grab' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      />
      {/* resize handle (bottom-right) */}
      <circle
        data-mode="scale"
        cx={p.x + p.w} cy={p.y + p.h} r={HANDLE_R}
        fill={SEL_COLOR} stroke="#fff" strokeWidth={1.5} style={{ cursor: 'nwse-resize' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      />
    </g>
  );
}

DielineCanvas.displayName = 'DielineCanvas';
export default DielineCanvas;
