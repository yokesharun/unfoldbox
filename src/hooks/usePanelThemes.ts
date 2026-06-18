import { useState } from 'react';

export interface ImgTransform {
  x: number;        // translate offset (user units)
  y: number;
  scale: number;    // relative to fitted size
  rotation: number; // degrees
}

export interface PanelTheme {
  color: string;
  imageUrl?: string;
  img?: ImgTransform;
}

export const DEFAULT_IMG: ImgTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

const PANEL_IDS = [
  'glue-flap', 'left-side', 'front', 'right-side', 'back',
  'tuck-flap-front', 'tuck-flap-back',
  'dust-flap-left', 'dust-flap-right',
  'bottom-tuck-front', 'bottom-tuck-back',
  'bottom-dust-left', 'bottom-dust-right',
  // wrap-card parts
  'wc-top-flap', 'wc-back', 'wc-front', 'wc-wing-left', 'wc-wing-right', 'wc-bottom-flap',
];

const DEFAULT_COLOR = '#a8d5dc';

function buildDefaults(): Record<string, PanelTheme> {
  const map: Record<string, PanelTheme> = {};
  for (const id of PANEL_IDS) map[id] = { color: DEFAULT_COLOR };
  return map;
}

export function usePanelThemes() {
  const [themes, setThemes] = useState<Record<string, PanelTheme>>(buildDefaults);

  function setColor(panelId: string, color: string) {
    setThemes(prev => ({ ...prev, [panelId]: { ...prev[panelId], color } }));
  }

  function setImage(panelId: string, imageUrl: string | undefined) {
    setThemes(prev => ({
      ...prev,
      [panelId]: { ...prev[panelId], imageUrl, img: { ...DEFAULT_IMG } },
    }));
  }

  function setImageTransform(panelId: string, partial: Partial<ImgTransform>) {
    setThemes(prev => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        img: { ...DEFAULT_IMG, ...prev[panelId]?.img, ...partial },
      },
    }));
  }

  function resetPanel(panelId: string) {
    setThemes(prev => ({ ...prev, [panelId]: { color: DEFAULT_COLOR } }));
  }

  return { themes, setColor, setImage, setImageTransform, resetPanel, panelIds: PANEL_IDS };
}
