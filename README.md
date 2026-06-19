# 📦 UnfoldBox

A browser-based packaging **dieline generator**. Enter your dimensions and UnfoldBox produces a print-ready flat dieline, an interactive 3D preview, and export files (PDF / SVG / PNG / JPEG) — all in the browser, no installs.

Two layouts are supported:
- **Box** — a reverse-tuck-end carton (glue flap, front/back/side panels, rounded tuck lids, dust flaps, thumb-notch).
- **Wrap Card** — a vertical envelope/wallet (top flap, back & front panels, side wings, bottom flap with a locking slit).

---

## Features

- **Flat dieline** — accurate, magenta cut lines + cyan fold/crease lines; locking slits cut as transparent holes.
- **Per-panel customisation** — set a background colour or upload artwork (PNG/JPG) per panel.
- **On-canvas image editing** — after uploading, select a panel and **drag to move**, **corner handle to resize** (aspect-locked), and **top handle to rotate** the image directly on the dieline.
- **3D preview** — orbit the assembled model; reflects the active layout and panel artwork.
- **Canvas zoom** — zoom the flat dieline in/out with the toolbar +/− buttons (click the % to reset) or Ctrl/Cmd + scroll.
- **Live dimensions** — change sizes in mm / cm / inch / px; the dieline rescales instantly. Wrap Card exposes card width, wing width, back-panel height, and top/bottom flap heights (front-panel height = back + top flap, auto).
- **Size calculator** — enter product dimensions + tolerance to get a suggested box size.
- **Toggles** — show/hide panel labels and bleed / safe-zone guides.
- **Export** — PDF (with crop marks), SVG, Cricut SVG, PNG (transparent), and JPEG. A **"Cut artwork only"** option strips all guide/cut lines and labels for clean cut-ready artwork (seams sealed so no white gaps). Files are named from a project name you choose.

---

## Getting Started

Requires **Node.js 20+**.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build a production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm run deploy` | Build and publish `dist/` to GitHub Pages |

---

## How to Use

1. **Pick a layout** — choose **Box** or **Wrap Card** in the left nav rail.
2. **Set dimensions** — enter sizes in the left panel; open *Optional Parameters* for flap/glue sizes and material thickness.
3. **Check the dieline** — the **Flat Dieline** tab shows the layout. Toggle **Labels** / **Bleed**, or open the **Size Calculator**.
4. **Customise panels** — in the right panel, select a panel to set its colour or upload an image; then move/resize/rotate the image on the canvas using its handles.
5. **Preview in 3D** — switch to **3D View** and drag to orbit.
6. **Export** — click **Export**, name your project, set options (margin, page size, perforated folds, orientation, *Cut artwork only*), and download.

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Ant Design** for UI
- **react-three-fiber** / **drei** for the 3D viewer
- **jsPDF** + **svg2pdf.js** for vector PDF export; SVG-to-canvas rasterisation for PNG/JPEG

---

## Project Structure

```
src/
  components/
    Dieline/         Flat dieline SVG renderer + on-canvas image editing
    Box3D/           3D viewer (reflects active layout)
    InputPanel/      Dimension inputs (layout-aware)
    PanelCustomiser/ Per-panel colour / image controls
    ExportDrawer/    Export modal + options + live preview
    BoxCalculator/   Product-size → box-size helper
    NavRail/         Box-type selector (dieline-shaped SVG icons)
  hooks/             useBoxGeometry, usePanelThemes
  utils/             geometry.ts (dieline math), export helpers
```

The core dieline math lives in [`src/utils/geometry.ts`](src/utils/geometry.ts) — `computeLayout(dims, boxType)` builds the panel shapes, SVG paths, and fold lines for each layout.
