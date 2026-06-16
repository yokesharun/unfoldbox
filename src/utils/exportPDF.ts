import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import type { DocOptions } from './exportSVG';

const MM_PER_PX = 0.264583;
const BLEED_MM = 3;
const MARK_LEN = 5; // crop mark length in mm

function addCropMarks(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.25);

  const bx = x - BLEED_MM;
  const by = y - BLEED_MM;
  const bx2 = x + w + BLEED_MM;
  const by2 = y + h + BLEED_MM;

  // Top-left corner
  pdf.line(bx - MARK_LEN, by, bx, by);
  pdf.line(bx, by - MARK_LEN, bx, by);
  // Top-right corner
  pdf.line(bx2, by, bx2 + MARK_LEN, by);
  pdf.line(bx2, by - MARK_LEN, bx2, by);
  // Bottom-left corner
  pdf.line(bx - MARK_LEN, by2, bx, by2);
  pdf.line(bx, by2, bx, by2 + MARK_LEN);
  // Bottom-right corner
  pdf.line(bx2, by2, bx2 + MARK_LEN, by2);
  pdf.line(bx2, by2, bx2, by2 + MARK_LEN);
}

export async function exportPDF(svgEl: SVGSVGElement, opts: DocOptions, filename = 'unfoldbox') {
  const svgW = svgEl.viewBox.baseVal.width || svgEl.clientWidth;
  const svgH = svgEl.viewBox.baseVal.height || svgEl.clientHeight;

  const wMm = svgW * MM_PER_PX + opts.margin * 2 * MM_PER_PX;
  const hMm = svgH * MM_PER_PX + opts.margin * 2 * MM_PER_PX;

  const orientation = opts.pageArrangement === 'horizontal' ? 'landscape' : 'portrait';

  // Add extra space for bleed and crop marks
  const extraMm = BLEED_MM + MARK_LEN + 2;
  const pageSizeMm: [number, number] = [wMm + extraMm * 2, hMm + extraMm * 2];

  let format: [number, number] | string = pageSizeMm;
  if (opts.pageSize === 'A4') format = 'a4';
  if (opts.pageSize === 'Letter') format = 'letter';

  const pdf = new jsPDF({ orientation, unit: 'mm', format });

  const offsetX = opts.pageSize === 'fit' ? extraMm : opts.margin * MM_PER_PX;
  const offsetY = opts.pageSize === 'fit' ? extraMm : opts.margin * MM_PER_PX;

  await svg2pdf(svgEl, pdf, { x: offsetX, y: offsetY });

  // Add crop marks around the content area
  addCropMarks(pdf, offsetX, offsetY, svgW * MM_PER_PX, svgH * MM_PER_PX);

  pdf.save(`${filename}.pdf`);
}
