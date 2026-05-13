# Earth Info Explorer

Interactive 3D Earth that shows country info when you click, with a
dropdown-based continent/country picker, a flexible coordinate input,
and tiered texture resolutions (with optional zoom-driven upgrades).

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

To build for production:

```bash
npm run build
npm run preview   # serves the built dist/
```

## Stack

- **Svelte 5** (runes mode) for components and reactivity.
- **Threlte 8** as the declarative Three.js wrapper.
- **Three.js 0.160** for rendering.
- **Vite 5** as the dev server + bundler.
- **REST Countries** (`restcountries.com`) for country metadata, cached
  in `localStorage` for 7 days.
- **BigDataCloud** (`api.bigdatacloud.net`) for reverse geocoding, cached
  for 30 days (rounded to ~10 km).
- **solarsystemscope.com** and **threejs.org** for Earth textures
  (2K / 4K / 8K).

## Project layout

```
src/
├── App.svelte                 top-level layout
├── main.js                    entry point
├── app.css                    global styles
└── lib/
    ├── Scene.svelte           wraps <Canvas>
    ├── SceneTree.svelte       all 3D contents (lives inside Canvas)
    ├── Earth.svelte           sphere mesh + click-to-coords + tier loader
    ├── Atmosphere.svelte      additive halo shader
    ├── Stars.svelte           starfield
    ├── Marker.svelte          pulsing pin on selected lat/lon
    ├── CameraController.svelte    listens to cameraTarget store, slerps
    ├── Controls.svelte        top control bar
    ├── InfoCard.svelte        bottom-left country card
    ├── ProgressWidget.svelte  texture loading progress
    ├── Toast.svelte           ephemeral error messages
    ├── stores.js              shared writable stores
    ├── selection.js           high-level "go to / select" actions
    ├── coords.js              lat/lon helpers + input parser
    ├── continents.js          centroid constants
    ├── api.js                 REST Countries + BigDataCloud with cache
    └── textures.js            tier definitions + cached loader
```

## Legacy

The pre-Svelte single-file version is preserved at
[`legacy/index.html`](./legacy/index.html). Open it directly in a
browser — no build step required.

## Cached data

All cleared by running `localStorage.clear()` from DevTools console.

| What                       | Where            | TTL     |
| -------------------------- | ---------------- | ------- |
| REST Countries `/all`      | `ei_countries_v1` | 7 days  |
| Reverse-geocode lookups    | `ei_geocode_v1`   | 30 days |
| Earth textures (per tier)  | in-memory + HTTP cache | session + browser cache |

## Dynamic resolution

Selecting **Dynamic** in the resolution dropdown lets the texture tier
follow zoom level:

| Distance        | Tier |
| --------------- | ---- |
| `> 3.0`         | 2K   |
| `1.8 – 3.0`     | 4K   |
| `< 1.8`         | 8K   |

Tiers only ever upgrade within a session — once 4K or 8K has loaded,
zooming back out keeps the higher tier so there's no flicker.
# earth-info
