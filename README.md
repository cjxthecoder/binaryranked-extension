# BinaryRanked Skill Chart Extension

A Chrome extension that overlays a 9-gon radar/skill chart on the BinaryRanked game site, visualizing your personal best performance across all 9 game modes.

## Game Modes Covered

| Mode        | Grid          |
|-------------|---------------|
| Sprint      | 4×8           |
| Classic     | 8×8           |
| Marathon    | 16×8          |
| Double      | 2×2 Checkers  |
| Ultra       | 32×8          |
| Zebra Rows  | 8×8           |
| 2-Step      | 8×8           |
| Split       | 8×8           |
| Consistency | 12×8          |

## How Skill Score Is Calculated

Each mode has a "par" time (a reasonable intermediate benchmark). Your personal best is converted to a **0–1 skill score** using:

```
ratio = par_time / your_pb_time
score = tanh(ratio × 0.8)
```

- Beat the par time → score above ~0.66
- Match the par time → score ~0.66
- Much faster → approaches 1.0
- No PB yet → shown as 0 / "—"

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder (`binaryranked-extension/`)
5. Navigate to [BinaryRanked](https://devcamp.studio/playground/champ/binary-online_game/)
6. Click the **📊 Skill Chart** button in the bottom-right corner

## Customization

### Adjusting Par Times

Edit `content.js` → `PAR_TIMES` to tune what counts as a "good" time for each mode:

```js
const PAR_TIMES = {
  sprint:      3.0,
  classic:     7.0,
  long:        15.0,
  double:      8.0,
  ultra:       31.0,
  zebra:       8.0,
  twostep:     8.0,
  split:       8.0,
  consistency: 11.5,
};
```

### Changing Colors

Edit `skill-chart.css` → `:root` CSS variables:

```css
--chart-accent: #2f65d4;   /* polygon stroke + dots */
--chart-fill:   #2f65d4;   /* filled area color */
--chart-grid:   #8899aa;   /* reference ring color */
```

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

- **Auto-refresh** after each completed game by observing DOM mutations on the score section
- **Persistent storage** using `chrome.storage.local` to track history over time
- **Trend arrows** showing improvement since last session
- **Percentile overlays** showing community average rings if leaderboard data is available
- **Export** chart as PNG via canvas
