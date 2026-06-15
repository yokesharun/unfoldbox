import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import type { DocOptions } from './exportSVG';

export async function exportPDF(svgEl: SVGSVGElement, opts: DocOptions, filename = 'unfoldbox') {
  const svgW = svgEl.viewBox.baseVal.width || svgEl.clientWidth;
  const svgH = svgEl.viewBox.baseVal.height || svgEl.clientHeight;

  const mmPerPx = 0.264583;
  const wMm = svgW * mmPerPx + opts.margin * 2;
  const hMm = svgH * mmPerPx + opts.margin * 2;

  const orientation = opts.pageArrangement === 'horizontal' ? 'landscape' : 'portrait';

  let format: [number, number] | string = [wMm, hMm];
  if (opts.pageSize === 'A4') format = 'a4';
  if (opts.pageSize === 'Letter') format = 'letter';

  const pdf = new jsPDF({ orientation, unit: 'mm', format });
  await svg2pdf(svgEl, pdf, { x: opts.margin, y: opts.margin });
  pdf.save(`${filename}.pdf`);
}
