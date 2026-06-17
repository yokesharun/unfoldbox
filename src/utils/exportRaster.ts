import { downloadBlob, stripGuides } from './exportSVG';
import type { DocOptions } from './exportSVG';

/**
 * Render an SVG element onto a canvas at the given scale.
 * Uses the SVG's own viewBox so the full drawing is captured (never clipped),
 * unlike snapshotting a scrollable DOM container.
 */
async function svgToCanvas(
  svgEl: SVGSVGElement,
  scale: number,
  opts: { background?: string; cleanCut?: boolean } = {},
): Promise<HTMLCanvasElement> {
  const vbW = svgEl.viewBox.baseVal.width || svgEl.clientWidth;
  const vbH = svgEl.viewBox.baseVal.height || svgEl.clientHeight;

  // Clone so we can guarantee explicit size + namespace on the serialised copy.
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(vbW));
  clone.setAttribute('height', String(vbH));
  // Drop the on-screen white background so the raster stays transparent unless
  // a background is explicitly requested (e.g. JPEG, which has no alpha).
  clone.style.background = 'transparent';
  clone.removeAttribute('fill');
  if (opts.cleanCut) stripGuides(clone);
  const background = opts.background;

  const str = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.width = vbW;
    img.height = vbH;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to rasterise SVG'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(vbW * scale));
    canvas.height = Math.max(1, Math.round(vbH * scale));
    const ctx = canvas.getContext('2d')!;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
      type,
      quality,
    );
  });
}

export async function exportPNG(svgEl: SVGSVGElement, opts: DocOptions, filename = 'unfoldbox') {
  const scale = opts.resolution / 96;
  const canvas = await svgToCanvas(svgEl, scale, { cleanCut: opts.cleanCut });  // transparent bg
  const blob = await canvasToBlob(canvas, 'image/png');
  downloadBlob(blob, `${filename}.png`);
}

export async function exportJPEG(svgEl: SVGSVGElement, opts: DocOptions, filename = 'unfoldbox') {
  const scale = opts.resolution / 96;
  const canvas = await svgToCanvas(svgEl, scale, { background: '#ffffff', cleanCut: opts.cleanCut });
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  downloadBlob(blob, `${filename}.jpg`);
}
