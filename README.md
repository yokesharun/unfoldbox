# 📦 UnfoldBox

A browser-based packaging **dieline generator** for reverse-tuck-end cartons. Enter your box dimensions and UnfoldBox produces a print-ready flat dieline, an interactive 3D preview, and export files (PDF / SVG / PNG / JPEG) — all in the browser, no installs.

---

## Features

- **Flat dieline** — accurate reverse-tuck-end layout (glue flap, front/back/side panels, rounded tuck lids, dust flaps, thumb-notches) with magenta cut lines and cyan fold/crease lines.
- **3D preview** — rotate the assembled box and play an open/close fold animation, with a procedural kraft-cardboard texture.
- **Per-panel customisation** — set a background colour or upload artwork (PNG/JPG) for each panel.
- **Live dimensions** — change Length / Width / Height / flap sizes in mm, cm, inch, or px and the dieline rescales instantly.
- **Size calculator** — enter product dimensions + tolerance to get a suggested box size.
- **Toggles** — show/hide panel labels and bleed / safe-zone guides.
- **Export** — print-ready PDF (with crop marks), SVG, Cricut SVG, PNG, and JPEG. Files are named from a project name you choose.

---

## Getting Started

Requires **Node.js 20+**.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev
```

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build a production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm run deploy` | Build and publish `dist/` to GitHub Pages |

---

## How to Use

1. **Set dimensions** — in the left panel, pick a unit and enter Length, Width, and Height. Open *Optional Parameters* for tuck-flap size, glue-flap size/angle, thumb-hole diameter, and material thickness.
2. **Check the dieline** — the **Flat Dieline** tab shows the layout. Use the toolbar to toggle **Labels**, **Bleed** guides, or open the **Size Calculator**.
3. **Customise panels** — in the right panel, select a panel to set its colour or upload an image. The change appears on both the dieline and the 3D model.
4. **Preview in 3D** — switch to the **3D View** tab, drag to orbit, and click **Animate** to watch the box fold.
5. **Export** — click **Export** (top right), name your project, choose options (margin, page size, DPI, perforated folds, page orientation), and download as PDF / SVG / Cricut SVG / PNG / JPEG.

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Ant Design** for UI
- **react-three-fiber** / **drei** / **react-spring** for the 3D viewer
- **jsPDF** + **svg2pdf.js** + **html-to-image** for exports

---

## Project Structure

```
src/
  components/
    Dieline/        Flat dieline SVG renderer
    Box3D/          3D box viewer + fold animation
    InputPanel/     Dimension inputs
    PanelCustomiser/ Per-panel colour / image controls
    ExportDrawer/   Export modal + options
    BoxCalculator/  Product-size → box-size helper
    NavRail/        Box-type selector
  hooks/            useBoxGeometry, usePanelThemes
  utils/            geometry.ts (dieline math), export helpers
```

The core dieline math lives in [`src/utils/geometry.ts`](src/utils/geometry.ts) — `computeLayout()` builds the panel rectangles, SVG flap paths, and fold lines from the box dimensions.
