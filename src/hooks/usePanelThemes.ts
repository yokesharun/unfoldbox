import { useState } from 'react';

export interface PanelTheme {
  color: string;
  imageUrl?: string;
}

const PANEL_IDS = [
  // reverse-tuck box
  'glue-flap', 'left-side', 'front', 'right-side', 'back',
  'tuck-flap-front', 'tuck-flap-back',
  'dust-flap-left', 'dust-flap-right',
  'bottom-tuck-front', 'bottom-tuck-back',
  'bottom-dust-left', 'bottom-dust-right',
  // cut-line with dust flaps box
  'df-glue-flap', 'df-front', 'df-left-side', 'df-back', 'df-right-side',
  'df-top-tuck-front', 'df-top-tuck-back',
  'df-top-dust-left', 'df-top-dust-right',
  'df-bottom-tuck-front', 'df-bottom-tuck-back',
  'df-bottom-dust-left', 'df-bottom-dust-right',
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
    setThemes(prev => ({ ...prev, [panelId]: { ...prev[panelId], imageUrl } }));
  }

  function resetPanel(panelId: string) {
    setThemes(prev => ({ ...prev, [panelId]: { color: DEFAULT_COLOR } }));
  }

  return { themes, setColor, setImage, resetPanel, panelIds: PANEL_IDS };
}
