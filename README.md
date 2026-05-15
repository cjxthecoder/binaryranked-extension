# BinaryRanked Skill Chart Extension

A Chrome extension that overlays a 9-gon radar/skill chart on the BinaryRanked game site, visualizing your personal best performance across all 9 game modes.

## Game Modes Covered

| Mode        | Grid          |
|-------------|---------------|
| Sprint (C)  | 4×8           |
| Classic (C) | 8×8           |
| Long (C)    | 16×8          |
| Double (C)  | (4×2)×(4×2)   |
| ULTRA (C)   | 32×8          |
| Zebra       | 8×(1×8)       |
| 2-Step      | 8×(4×2)       |
| Split       | 8×(2×4)       |
| Consistency | 12×8          |

## How Skill Score Is Calculated

Each mode has a time based on the WR time, top 5% time, or top 10% time. Your personal best is converted to a **0–1 skill score** using:

```
score = min(standard_time / your_pb_time, 1.0)
```

- Beat the time → score = 1.0
- 2x slower → score = 0.5
- No PB yet → "—"

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder (`binaryranked-extension/`)
5. Navigate to [BinaryRanked](https://devcamp.studio/playground/champ/binary-online_game/)
6. Click the **📊 Skill Chart** button in the bottom-right corner

## Project Structure

```
binaryranked-extension/
├── manifest.json      — Extension metadata & permissions
├── content.js         — Injected into BinaryRanked page; reads PBs & renders chart
├── skill-chart.css    — Overlay styles (dark gaming aesthetic)
├── popup.html         — Extension popup UI
├── popup.js           — Popup logic
└── README.md          — This file
```

## Next Steps / Ideas

- **Export** chart as PNG via canvas
