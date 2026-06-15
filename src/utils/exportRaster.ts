import { toPng, toJpeg } from 'html-to-image';
import { downloadBlob } from './exportSVG';

export async function exportPNG(el: HTMLElement, resolution: number, filename = 'unfoldbox') {
  const scale = resolution / 96;
  const dataUrl = await toPng(el, { pixelRatio: scale });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  downloadBlob(blob, `${filename}.png`);
}

export async function exportJPEG(el: HTMLElement, resolution: number, filename = 'unfoldbox') {
  const scale = resolution / 96;
  const dataUrl = await toJpeg(el, { pixelRatio: scale, quality: 0.92 });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  downloadBlob(blob, `${filename}.jpg`);
}
