export interface DocOptions {
  margin: number;
  pageSize: 'fit' | 'A4' | 'Letter';
  resolution: number;
  perforateFolds: boolean;
  perforationLength: number;
  perforationGap: number;
  pageArrangement: 'vertical' | 'horizontal';
  cricut?: boolean;
  cleanCut?: boolean;   // strip fold lines, labels & guide marks (cut artwork only)
}

export const DEFAULT_OPTS: DocOptions = {
  margin: 25,
  pageSize: 'fit',
  resolution: 150,
  perforateFolds: false,
  perforationLength: 5,
  perforationGap: 1,
  pageArrangement: 'horizontal',
  cleanCut: false,
};

/**
 * Strip every line & mark, leaving only the filled artwork:
 *  - fold lines (<line>) and labels (<text>)
 *  - all stroke-only outlines (fill="none") — cut outlines, bleed/safe guides
 * The slit hole stays (it lives in the filled panel path via fill-rule="evenodd").
 */
export function stripGuides(svg: SVGSVGElement) {
  svg.querySelectorAll('line').forEach(el => el.remove());
  svg.querySelectorAll('text').forEach(el => el.remove());
  svg.querySelectorAll('[fill="none"]').forEach(el => el.remove());
}

export function prepareSvgClone(svgEl: SVGSVGElement, opts: DocOptions): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  if (opts.cleanCut) stripGuides(clone);
  if (opts.cricut) {
    clone.querySelectorAll('rect,path,polygon').forEach(el => {
      (el as SVGElement).setAttribute('fill', 'none');
      (el as SVGElement).setAttribute('stroke', '#000000');
      (el as SVGElement).setAttribute('stroke-width', '0.5');
    });
  }
  return clone;
}

export function exportSVG(svgEl: SVGSVGElement, opts: DocOptions, filename = 'unfoldbox') {
  const clone = prepareSvgClone(svgEl, opts);
  const serialiser = new XMLSerializer();
  const svgStr = serialiser.serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${filename}${opts.cricut ? '-cricut' : ''}.svg`);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
