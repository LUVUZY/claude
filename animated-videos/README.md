# The Buyers Mind: animated reels

Remotion project for vertical (1080x1920, 30fps) Instagram Reels / Shorts promoting the two toolkits.

| Composition | Length | Style |
|---|---|---|
| `BuyersMind2D` | 20s | Flat 2D explainer: hook, two reasons a sale dies, both toolkits, call to action |
| `BuyersMind3D` | 16s | 3D scene (three.js): buyers walk past a dull product, it gets fixed, we see inside a buyer's mind, they turn toward it |

## Edit
- Colours, fonts and the toolkit bullet points: `src/brand.ts`
- 2D scenes: `src/TwoD.tsx`
- 3D scene and captions: `src/ThreeD.tsx`

## Run
```bash
npm install
npm run studio      # live preview in the browser
npm run render2d    # -> out/buyers-mind-2d.mp4
npm run render3d    # -> out/buyers-mind-3d.mp4
```
If Remotion can't download its own browser, point it at an installed Chrome with `REMOTION_BROWSER=/path/to/chrome`.
