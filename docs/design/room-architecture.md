# Room architecture (3D homepage)

Read this before touching anything under `src/components/room/`. It is the contract every contributor builds against.

The homepage is a cozy low-poly cut-away room rendered with three.js via React Three Fiber (`three@0.186`, `@react-three/fiber@9`, `@react-three/drei@10`). The approved visual and interaction reference is `docs/design/prototypes/room-3d.html` (plain three r170). Port its geometry, palette, canvas-texture tricks, and lighting wherever sensible; the rebuild must look at least as good.

## Rules (all contributors)

- **No em dash character** (U+2014) anywhere: code, comments, copy, docs. Use commas, colons, parentheses, or hyphens.
- **No new dependencies.** Everything needed is installed: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.
- **Only edit the files you own** (see the ownership map). If you need a change in a shared file (store, registry, helpers, Scene, content), describe it in your report instead of making it.
- **Do not run `npm run build`, `npm run dev`, or `rm -rf .next`.** A dev server is already running at `http://localhost:3000` with hot reload. Check your work with `npx tsc -p tsconfig.json --noEmit` (fix errors in your own files only; ignore errors elsewhere, other agents are mid-edit) and `npx eslint <your files>`.
- **Browser checks:** you may use the built-in browser, but only in **your own tab**: call `tabs_create`, then pass that `tabId` on every browser call. Never navigate, close, or resize another tab. Useful URLs:
  - `http://localhost:3000/?time=night` (also `dawn`, `day`, `dusk`)
  - `http://localhost:3000/?orbit=1&time=day` (dev-only free orbit camera, drag to rotate, scroll to zoom)
  - `http://localhost:3000/work`, `/games`, `/cars`, `/about`, `/places`, `/contact`, `/about#teeko` (start zoomed on a hotspot)
- Follow `AGENTS.md`: TypeScript strict, no `any`, named exports, double quotes, 2 spaces, `"use client"` first in client files, imports ordered React, next, third party, `@/`, relative.
- R3F mutates three.js objects imperatively. `react-hooks/immutability` is disabled for `src/components/room/**`; other React lint rules still apply.

## File ownership map

| Area | Files | Owner |
|---|---|---|
| Foundation (shared) | `store.tsx`, `hotspots.ts`, `Scene.tsx`, `RoomCanvas.tsx`, `CameraRig.tsx`, `Lighting.tsx`, `timeOfDay.ts`, `materials.ts`, `textures.ts`, `geometry.ts`, `Hotspot.tsx`, `Interaction.tsx`, `Markers.tsx`, `HoverLabel.tsx`, `src/lib/room-content.ts`, `src/lib/room-projects.ts`, all route `page.tsx` files for `/`, `/work`, `/games`, `/cars`, `/about`, `/places`, `/contact` | Lead (orchestrator) |
| Shell and street | `objects/RoomShell.tsx`, `objects/WindowStreet.tsx` | Agent 1 |
| Desk set | `objects/DeskSet.tsx` | Agent 2 |
| Games corner | `objects/GamesCorner.tsx` | Agent 3 |
| Wall pieces | `objects/Corkboard.tsx`, `objects/PlacesFrames.tsx`, `objects/Decor.tsx` | Agent 4 |
| Teeko | `objects/Teeko.tsx` | Agent 5 |
| UI and routing | `RoomExperience.tsx`, everything in `ui/`, `src/app/plain/page.tsx` | Agent 6 |
| SEO and classic pages | `seo/RoomJsonLd.tsx`, `src/lib/room-metadata.ts`, `src/lib/markdown-pages.ts`, `src/middleware.ts`, `src/app/sitemap.ts`, `public/llms.txt`, `src/app/opengraph-image.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/case-studies/[slug]/page.tsx` | Agent 7 |

All paths above without a prefix are relative to `src/components/room/`.

## How the pieces fit

```
page.tsx (server, metadata)                 e.g. src/app/work/page.tsx
  <RoomJsonLd spot="work" />
  <RoomExperience initialSpot="work" projects={getRoomProjects()} />   (client, SSR'd)
     <RoomProvider>                          store.tsx: per-instance store + URL sync
       DOM UI: Panel, SpotNav, TitleCard, RoomLoader, CornerCard, TimeControl, Fallback (ui/)
       <RoomCanvas/>  (next/dynamic, ssr:false)
          <Scene/>: Lighting, CameraRig, Interaction, Markers, HoverLabel,
                    RoomShell, WindowStreet, DeskSet, GamesCorner,
                    Corkboard, PlacesFrames, Decor, Teeko   (each in its own <Suspense>)
```

- **Routing.** Opening a panel calls `history.pushState` to the spot's route (Next 16 keeps the page mounted and syncs `usePathname`). Teeko's URL is `/about#teeko`. Back/Forward trigger `popstate`, and the store re-derives `openSpot` from `location` via `spotFromLocation()` in `room-content.ts`. Closing from a panel that was pushed over the overview goes `history.back()`; otherwise it pushes `/`. Switching directly between panels replaces the entry.
- **Content.** Every string shown in a panel comes from `src/lib/room-content.ts` (`ROOM_SECTIONS`, `ROOM_INTRO`, `LONGER_CONTENT`). Unknown personal details are `ph("Label", "key")` placeholders; `ROOM_PLACEHOLDERS` lists them all. The work panel's projects come from the `projects` prop (`getRoomProjects()` in `src/lib/room-projects.ts`, server side), so case study data never ships to the client.

## Store (`store.tsx`)

```ts
const store = useRoomStore();          // stable; use inside useFrame
store.getState().openSpot;             // read without re-rendering
store.fx.lampLevel;                    // eased 0..1 lamp level, per frame
store.fx.teeko;                        // { x, z, heading, awake }: Teeko's live floor pose, per frame
const phase = useRoom((s) => s.phase); // subscribe (re-renders on change)
const actions = useRoomActions();      // openSpot, closeSpot, toggleLights, setTimeMode, pokeTeeko, invalidateShadows...
```

State: `openSpot`, `hoveredSpot`, `navFocus`, `lightsOn`, `timeMode`, `phase`, `firstClickDone`, `teekoPokedAt`, `sheet`, `reducedMotion`, `canvasLoaded`, `ready` (first frame drawn), `failed`.

`store.fx.teeko` is written every frame by `Teeko.tsx` (world x/z, heading as rotation.y in radians, and `awake` = up and off his bed). It is read by `Interaction.tsx` (his pick box follows him), `HoverLabel.tsx` (the chip follows him), and `CameraRig.tsx` (the teeko view target follows him). Its initial value is his bed, (0.85, 1.35).

**3D components must not re-render per frame.** Read `store.getState()` / `store.fx` inside `useFrame`. Subscribe with `useRoom` only for rare changes (phase, lightsOn if you prefer).

## Object component contract

Each object file exports one named component with no props, e.g. `export function DeskSet()`. It is already mounted by `Scene.tsx` inside its own `<Suspense fallback={null}>`, so hot reload shows your changes immediately.

- **Coordinates and units.** +y is up; 1 unit is roughly 1 foot. The interior spans x -5..5 and z -5..5; the floor top is y = 0 and walls are 6 high (`HW = 5`, `WH = 6`, wall thickness `T = 0.3`). The back wall's inner face is z = -5, the left wall's inner face is x = -5. The room is open toward +x and +z; the overview camera looks from about (17.4, 16, 17.4) at (0, 1.8, 0) with a 30 degree vertical FOV. Window hole on the left wall: z -3.5..-0.3, y 1.4..4.9 (center z -1.9, y 3.15).
- **Hotspots.** Wrap the meshes that should glow on hover in `<Hotspot id="work">...</Hotspot>`. Several wrappers may share an id (e.g. the window and the key hook both use `cars`). Hit areas, labels, markers, and camera views are defined centrally in `hotspots.ts`; if yours need to move, report the new values. Do **not** add `onClick` / `onPointerOver` handlers: picking is central (`Interaction.tsx`).
- **Materials.** `std(color, opts)` returns a shared cached `MeshStandardMaterial` (roughness 0.82). Never mutate it. For anything you animate, use `stdUnique(...)` or your own `useMemo` material, and set `userData={{ noHighlight: true }}` on that mesh if it sits inside a `<Hotspot>` (the wrapper clones materials on mount; animated ones must keep their identity). Use `screenMaterial(tex)` for screens (unlit, not tone mapped).
- **Geometry.** `roundedBox(w,h,d,r?)` (the prototype's `rbox`), `box`, `cylinder`, `sphere`, `plane` return cached shared geometries: never mutate them. For custom geometry, create it in `useMemo` and dispose it on unmount. `rodTransform(a, b)` gives position/quaternion/scale for a unit-height cylinder between two points. `mulberry32(seed)` / `seededRange(seed)` for stable procedural layouts.
- **Canvas textures.** `createCanvasTexture(w, h, draw, { nearest, srgb, repeat })` inside `useMemo`; `redraw(tex, draw?)`; `useThrottledRedraw(tex, fps, draw)` for animated screens (code 20fps, game 24fps); `roundRect`; `softTexture()` (shared radial falloff for steam, glows, blobs; do not dispose). For text use `g.font = canvasFont("display" | "body" | "hand", sizePx, weight)` (Fraunces, Plus Jakarta Sans, Caveat) and redraw static text when `useFontsReady()` flips true.
- **Shadows.** `castShadow` / `receiveShadow` on meshes as in the prototype. The shadow map is static; it re-renders only when asked. If something moves in a way that should move its shadow, call `store.actions.invalidateShadows(frames)` or set `store.fx.shadowFrames`. Teeko does not need this: he moves every frame while awake, so he does not cast into the static shadow map and uses his own soft blob shadow on the floor instead (his bed still casts and receives as before).
- **Time of day.** `const { phase, config } = usePhase()` (from `Lighting.tsx`) gives `"night" | "dawn" | "day" | "dusk"` and the `TODS` preset (`sky`, `stars`, `moon`, ...). Apply phase-dependent emissives in an effect on `phase`.
- **Lamps.** `const lampLevel = useLampLevel()` returns a getter; inside `useFrame`, `light.intensity = 22 * lampLevel()`. It eases toward `lightsOn` (instant under reduced motion).
- **Reduced motion.** `store.getState().reducedMotion`: skip bobbing, hops, and parallax-like motion (ambient screen animation may continue).
- **Performance.** Reuse geometries/materials, no per-frame allocations inside `useFrame` (hoist vectors), keep draw calls reasonable (merge tiny repeated parts or use `<Instances>` from drei when there are dozens), throttle canvas redraws.

### Teeko (`objects/Teeko.tsx`)

- **Behavior by phase.** Day and dusk: awake, he gets out of his bed and roams (walks and runs) around the open floor. Night and dawn: asleep, curled in his bed on the rug at (0.85, 0, 1.35).
- **Interaction.** Hovering him while awake makes him stop and look at the camera. Clicking yips (`pokeTeeko`) and opens his panel (`/about#teeko`); the camera frames him wherever he is.
- **Live pose.** He writes `store.fx.teeko` (`x`, `z`, `heading`, `awake`) every frame. The `teeko` entry in `hotspots.ts` holds his bed values; while `awake` is true, the x/z of his hit box (`Interaction.tsx`), hover chip anchor (`HoverLabel.tsx`), and view target (`CameraRig.tsx`) follow his live position instead.
- **Shadow.** He uses a soft blob shadow on the floor and does not cast into the static shadow map, so moving him never needs `invalidateShadows`.

### Practical lights (who owns which)

Global lights (hemisphere, sun with the shadow map, fill), fog, and exposure live in `Lighting.tsx`. Each object owns its practical lights, with values from the prototype:

| Light | Owner | Prototype values |
|---|---|---|
| Desk lamp `SpotLight('#ffc98a', 22*L, 9, .75, .6, 2)` | DeskSet | at lamp head, target (3.0, 1.55, -3.85) |
| Monitor glow `PointLight('#22d3ee', 3.5, 5.5, 2)` | DeskSet | (2.4, 2.4, -3.8) |
| Arc lamp `PointLight('#ffbf7a', 16*L, 14, 2)` with 512 shadow | GamesCorner | at the relocated dome |
| TV glow `PointLight('#8fb0ff', 2.4 + flicker, 5.5, 2)` | GamesCorner | (-4.0, 1.6, 3.1) |
| Fairy light `PointLight('#ffcf8a', 5*L, 9, 2)` | Decor | (-2.5, 5.0, -2.5) |
| Street light `PointLight('#ffcf8a', 30/8/0, 9, 1.4)` night/dusk-dawn/day | WindowStreet | (-9.9, 3.6, 1.2) |
| Teeko rim light (optional, subtle, no shadow) | Teeko | near Teeko |

Do not add other lights without saying so in your report.

## Palette (`materials.ts`)

```
wall #efe4d2   wain #7f9d8c   trim #f6efe3   cap #3e2c23   base #4a3428
oak #cfa57a    walnut #8a5a3c dark #1a1f2a   navy #24324d  coral #e8704f
cream #f3ede2  mustard #d8a25e cyan #22d3ee  brass #c9a15a teal #2a8f8a
red #d93b3b    glass #9cc3dd  warmLight #ffc98a
TEEKO: coat #1d1b22, coatLift #2e2a33, tan #b8834f, tanShade #8f6238, muzzle #b8834f (tan),
       chest #3d3842, innerEar #5a4446, nose #0b0a0d, eye #07070a, eyeHighlight #ffffff,
       tongue #e98a8a, bed #b5543f, bedCushion #e9d8bf
       (black-and-tan coat: tan chest and throat, belly, lower legs and paws, under-tail,
       two eyebrow dots, cheeks, and muzzle; face and back black)
```

## Layout reservations

Keep to these so pieces do not collide. Values are approximate; report your final bounds.

| Piece | Where | Owner |
|---|---|---|
| Corkboard (about) | back wall, x -3.85..-0.55, y 2.2..4.5 | Wall pieces |
| Clock | back wall, (0.3, 4.4) | Wall pieces |
| Light switch (switch) | back wall, (0.3, 2.55) | Wall pieces |
| String lights | top of back and left walls, y ~5.55 | Wall pieces |
| Desk, monitor, lamp, chair, phone | back wall, x 0.75..4.45, z -5..-2.3 | Desk set |
| Shelf (books, trophy, toy car, pothos) | back wall, x 1.05..3.95, y 4.2 | Desk set |
| Window, curtains, sill cactus (cars) | left wall, z -3.5..-0.3 (curtains to z ~-4.2 and ~0.36) | Shell and street |
| Car keys hook (cars) | left wall, z ~-4.55, y ~3.35 (make it bigger and easier to spot than the prototype) | Wall pieces |
| **USA and India frames (places)** | left wall, z ~0.45..2.2, y ~3.0..3.9, two frames side by side (India nearer the window or either order, your call) | Wall pieces |
| Family photo (decor, not a hotspot) | left wall, z 2.35..3.85, y 3.1..4.3 | Games corner |
| TV, stand, console, cases | left wall, z 1.6..4.6, floor to y 2.3 | Games corner |
| Bean bag + controller | floor, around (-2.4, 0, 3.15) | Games corner |
| **Arc floor lamp** | moved off the left wall strip (its old pole at z 1.25 collides with the frames): base near (-3.3, 0, 4.5) arching over the bean bag, or another spot in the front-left that keeps the frames clear | Games corner |
| Snake plant | floor, back-left corner (-4.3, 0, -4.3) | Wall pieces (Decor) |
| Rug | floor, centered (-0.4, 0.02, 1.15), ~5.2 x 3.9 oval | Wall pieces (Decor) |
| Teeko + dog bed (teeko) | bed on the rug at (0.85, 0, 1.35); awake, Teeko roams the open floor | Teeko |

## Hotspot registry (initial values, tuned in Phase 2)

| id | label / hint | hit center, size | view target, dir, radius |
|---|---|---|---|
| work | Work / the desk | (2.55,1.65,-3.7), (4.1,3.3,3.0) | (2.5,2.05,-4.1), (.12,.38,1), 1.9 |
| contact | Contact / the phone | (1.28,1.72,-3.88), (.85,.5,.85), priority 2 | (1.28,1.58,-3.88), (.15,1.1,.7), .5 |
| games | Games / the console | (-3.35,1.25,3.1), (3.4,2.5,3.2) | (-4.3,1.45,3.1), (1,.3,-.05), 1.55 |
| cars | Cars / the window | (-4.95,3.1,-2.4), (.8,4.1,5.3) | (-5.2,2.95,-1.9), (1,.13,.02), 2.25 |
| about | About / the wall | (-2.2,3.35,-4.8), (3.5,2.5,.5) | (-2.2,3.35,-4.85), (.1,.05,1), 1.75 |
| places | Places / the frames | (-4.85,3.45,1.3), (.5,1.3,2.0) | (-4.9,3.45,1.3), (1,.1,.05), 1.3 |
| teeko | Teeko / the dog; anchor (.85,.95,1.35) | (.85,.35,1.35), (1.3,.8,1.2); x/z follow `fx.teeko` while awake | (.85,.32,1.35), (.6,.75,1), .85; target x/z follow `fx.teeko` while awake |
| switch | Lights | (.3,2.55,-4.85), (.5,.6,.4), priority 3 | none (toggles lights) |

## Prototype map (`docs/design/prototypes/room-3d.html`)

| Lines | Section |
|---|---|
| 19-276 | CSS (panel, chip, HUD, title card, nav, sheet mode, reduced motion) |
| 278-329 | Body markup |
| 378-426 | Geometry and texture helpers |
| 428-433 | Palette |
| 435-532 | Room shell, floor planks, wainscot, caps, fairy lights |
| 541-639 | Desk set |
| 641-659 | Phone |
| 661-703 | Shelf |
| 705-726 | Clock and light switch |
| 728-823 | Corkboard (photos, notes, string) |
| 825-870 | Window, curtains, cactus, car keys |
| 872-916 | Games corner |
| 918-981 | Poster, snake plant, rug, arc lamp |
| 983-1008 | Cat (replaced by Teeko) |
| 1010-1112 | Street, houses, trees, street lamp, BMW M235i Gran Coupe |
| 1114-1165 | Sky, stars, moon, clouds, stencil portal |
| 1167-1250 | Lights and time of day |
| 1252-1381 | Code and game screen textures |
| 1383-1463 | Hotspots, camera views |
| 1465-1613 | Panel content, open/close, interaction |
| 1615-1653 | Title card, purr, steam and zzz sprites |
| 1655-1817 | Loop |
