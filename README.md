# BinaryRanked Utility Extension

A Chrome extension that enhances the BinaryRanked experience with:

- 📊 Skill chart overlay  
- 📈 Average (Ao5 / session) tracking  
- 🌍 Easy-to-view global ranks  
- 🎛 Button customization  
- ⚡ Quality-of-life improvements  

Designed to stay lightweight and unobtrusive while adding meaningful competitive insight.

---

## Features

### 📊 9-Mode Skill Radar Chart

Visualizes your performance across all game modes using a radar chart overlay.

The chart converts your personal bests into normalized skill scores relative to competitive benchmarks.

---

### 📈 Average Tracking

- Displays recent Ao5 breakdowns  
- Properly handles DNFs  
- Marks best and worst solves  
- Helps track consistency trends  

Built to reflect actual competitive averaging behavior.

---

### 🌍 Global Rank Viewer

Quickly view your global rank in each mode without navigating away from the main interface.

Optimized for fast comparison and readability.

---

### 🎛 UI Customization

- Toggle overlay visibility  
- Adjust button placement  
- Clean, minimal styling  
- Designed to blend naturally with the native UI  

---

### ⚡ Quality-of-Life Enhancements

Small interface refinements that make competitive play smoother and more informative without disrupting gameplay.

---

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

---

## Skill Score Formula

Each personal best is converted to a normalized skill score:

```
score = min(benchmark_time / your_pb_time, 1.0)
```

- Faster than benchmark → 1.0  
- Slower → proportional score  
- No PB → not shown  

Benchmarks are based on competitive reference times.

---

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extension folder
5. Open BinaryRanked in your browser
6. Use the extension controls directly within the game page

---

## Project Structure

```
binaryranked-extension/
├── manifest.json
├── content.js
├── skill-chart.css
├── popup.html
├── popup.js
└── README.md
```

---

## Future Ideas

- Expanded session statistics panel  
- Exportable performance history  
- Additional visual themes  
- Advanced consistency metrics