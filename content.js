// BinaryRanked Skill Chart - Content Script
// Reads personal best times from the page and renders a 9-gon skill chart

const MODES = [
  { lsKey: "classic",     label: "Classic",     color: "#eab308", textColor: "#a16207" },
  { lsKey: "long",        label: "Long",        color: "#eab308", textColor: "#a16207" },
  { lsKey: "ultra",       label: "ULTRA",       color: "#c084fc", textColor: "#7e22ce" },
  { lsKey: "consistency", label: "Consistency", color: "#e879f9", textColor: "#a21caf" },
  { lsKey: "zebra",       label: "Zebra",       color: "#38bdf8", textColor: "#0369a1" },
  { lsKey: "split",       label: "Split",       color: "#2dd4bf", textColor: "#0f766e" },
  { lsKey: "2step",       label: "2-Step",      color: "#34d399", textColor: "#047857" },
  { lsKey: "double",      label: "Double",      color: "#818cf8", textColor: "#4338ca" },
  { lsKey: "short",       label: "Sprint",      color: "#eab308", textColor: "#a16207" },
];

const MODES_LIST = [
  { lsKey: "short",       label: "Sprint",      colorType: "yellow" },
  { lsKey: "classic",     label: "Classic",     colorType: "yellow" },
  { lsKey: "long",        label: "Long",        colorType: "yellow" },
  { lsKey: "ultra",       label: "ULTRA",       colorType: "purple" },
  { lsKey: "consistency", label: "Consistency", colorType: "fuchsia" },
  { lsKey: "double",      label: "Double",      colorType: "indigo" },
  { lsKey: "2step",       label: "2-Step",      colorType: "emerald" },
  { lsKey: "split",       label: "Split",       colorType: "teal" },
  { lsKey: "zebra",       label: "Zebra",       colorType: "sky" },
];

const STAT_CARD_ORDER = [
    "stat-best-short", "stat-best-classic", "stat-best-long",
    "stat-best-double", "stat-best-2step", "stat-best-split",
    "stat-best-ultra", "stat-best-consistency", "stat-best-zebra",
];

const STAT_CARD_COLORS = {
  yellow:   { border: "border-yellow-100",  bg: "bg-yellow-50",     label: "text-yellow-500",   value: "text-yellow-700" },
  purple:   { border: "border-purple-100",  bg: "bg-purple-50/50",  label: "text-purple-400",   value: "text-purple-700" },
  fuchsia:  { border: "border-fuchsia-100", bg: "bg-fuchsia-50/50", label: "text-fuchsia-400",  value: "text-fuchsia-700" },
  indigo:   { border: "border-indigo-100",  bg: "bg-indigo-50/50",  label: "text-indigo-400",   value: "text-indigo-700" },
  emerald:  { border: "border-emerald-100", bg: "bg-emerald-50/50", label: "text-emerald-400",  value: "text-emerald-700" },
  teal:     { border: "border-teal-100",    bg: "bg-teal-50/50",    label: "text-teal-400",     value: "text-teal-700" },
  sky:      { border: "border-sky-100",     bg: "bg-sky-50/50",     label: "text-sky-400",      value: "text-sky-700" },
};

const MODE_SELECTED_BG = {
  "btn-short":        "bg-blue-600",    // #2563eb
  "btn-classic":      "bg-blue-600",
  "btn-long":         "bg-blue-600",
  "btn-double":       "bg-indigo-600",  // #4f46e5
  "btn-ultra":        "bg-purple-600",  // #9333ea
  "btn-zebra":        "bg-gray-800",    // #1f2937
  "btn-2step":        "bg-gray-800",
  "btn-split":        "bg-gray-800",
  "btn-consistency":  "bg-gray-800",
};

// Reference world record times (seconds)
const WR_TIMES = {
  "short":        1.12,
  "classic":      2.652,
  "long":         5.829,
  "double":       2.244,
  "ultra":        14.96,
  "zebra":        1.228,
  "2step":        1.485,
  "split":        0.838,
  "consistency":  3.007,
};

// Reference elite times (seconds, top 5%)
const ELITE_TIMES = {
  "short":        1.822,
  "classic":      4.118,
  "long":         8.347,
  "double":       4.118,
  "ultra":        18.21,
  "zebra":        4.395,
  "2step":        2.703,
  "split":        4.248,
  "consistency":  4.788,
};

// Reference strong times (seconds, top 10%)
const STRONG_TIMES = {
  "short":        1.984,
  "classic":      4.431,
  "long":         8.982,
  "double":       5.425,
  "ultra":        19.888,
  "zebra":        5.394,
  "2step":        4.46,
  "split":        5.659,
  "consistency":  5.625,
};

// Labels corresponding to each time table
const REFERENCE_TABLES = {
  wr: WR_TIMES,
  elite: ELITE_TIMES,
  strong: STRONG_TIMES,
};

// ---------------------------------------------------------------------------
// Panel updates
// ---------------------------------------------------------------------------
let currentPanel = 0;
const PANELS = ["Skill Chart", "Global Rankings", "Average Tracker"];

function showPanel(index) {
  currentPanel = index;
  document.querySelector(".br-chart-title").textContent = PANELS[index];
  const svgWrap = document.getElementById("br-chart-svg-wrap");
  // swap content based on index
  if (index === 0) {
    refreshChart();
  } else if (index === 1) {
    refreshRankings();
  } else if (index === 2) {
    refreshAverage();
  }
  const onMainPanel = index === 0;
  document.getElementById("br-chart-refresh").disabled = !onMainPanel;
  document.getElementById("br-chart-select").disabled = !onMainPanel;
  updateNavButtons();
}

function updateNavButtons() {
  document.getElementById("br-chart-prev").disabled = currentPanel === 0;
  document.getElementById("br-chart-next").disabled = currentPanel === PANELS.length - 1;
}

// ---------------------------------------------------------------------------
// QOL cleanups
// ---------------------------------------------------------------------------
function cleanLabels() {
  document.querySelectorAll("div.stat-card.border-gray-300.bg-gray-100").forEach(el => {
    el.classList.remove("border-gray-300", "bg-gray-100");
  });
  document.querySelectorAll("span.stat-label.text-blue-400").forEach(el => {
    el.classList.replace("text-blue-400", "text-blue-500");
  });
  document.querySelectorAll("span.stat-label.text-gray-500").forEach(el => {
    el.classList.remove("text-gray-500");
  });
  document.querySelectorAll("span#stat-best-consistency.stat-value.text-gray-800").forEach(el => {
    el.classList.remove("text-gray-800");
  });
  document.querySelectorAll("span.text-\\[9px\\].font-normal.opacity-70.block").forEach(el => {
    if (el.textContent.trim() === "Standard") el.textContent = "Classic";
    if (el.textContent.trim() === "Marathon") el.textContent = "Long";
  });
}

function reorderSpecialPatterns() {
  const grid = document.querySelector(".grid.grid-cols-2.gap-2:not(.mb-4)");
  if (!grid || grid.dataset.draggable) return;

  const BTN_ORDER = [
    "btn-2step", "btn-consistency",
    "btn-split", "btn-zebra",
  ];

  BTN_ORDER.forEach(id => {
    const card = grid.querySelector(`#${id}`)?.closest(".mode-btn");
    if (card) grid.appendChild(card);
  });
}

function reorderStatCards() {
  const grid = document.querySelector("#career-stats-content .grid.grid-cols-3");
  if (!grid || grid.dataset.draggable) return;

  STAT_CARD_ORDER.forEach(id => {
    const card = grid.querySelector(`#${id}`)?.closest(".stat-card");
    if (card) grid.appendChild(card);
  });

  MODES_LIST.forEach(mode => {
    const valueEl = grid.querySelector(`#stat-best-${mode.lsKey}`);
    if (!valueEl) return;
    const card = valueEl.closest(".stat-card");
    const label = card.querySelector(".stat-label");
    const colors = STAT_CARD_COLORS[mode.colorType];
    if (!colors) return;

    // Remove existing color classes first
    card.classList.remove(...Object.values(STAT_CARD_COLORS).flatMap(c => [c.border, c.bg]));
    label.classList.remove(...Object.values(STAT_CARD_COLORS).map(c => c.label));
    valueEl.classList.remove(...Object.values(STAT_CARD_COLORS).map(c => c.value));

    card.classList.add(colors.border, colors.bg);
    label.classList.add(colors.label);
    valueEl.classList.add(colors.value);
  });
}

function makeSpecialPatternsDraggable() {
  const grid = document.querySelector(".grid.grid-cols-2.gap-2:not(.mb-4)");
  if (!grid || grid.dataset.draggable) return;
  grid.dataset.draggable = "true";

  let dragSrc = null;

  grid.querySelectorAll(".mode-btn").forEach(btn => {
    btn.draggable = true;

    btn.addEventListener("dragstart", () => {
      dragSrc = btn;
      btn.style.opacity = "0.3";
    });

    btn.addEventListener("dragend", () => {
      btn.style.opacity = "";
    });

    btn.addEventListener("dragover", e => e.preventDefault());

    btn.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === btn) return;

      const parent = btn.parentNode;
      const dragIndex = [...parent.children].indexOf(dragSrc);
      const dropIndex = [...parent.children].indexOf(btn);

      if (dragIndex < dropIndex) {
        parent.insertBefore(dragSrc, btn.nextSibling);
      } else {
        parent.insertBefore(dragSrc, btn);
      }
    });
  });
}

function makeStatCardsDraggable() {
  const grid = document.querySelector("#career-stats-content .grid.grid-cols-3");
  if (!grid || grid.dataset.draggable) return;
  grid.dataset.draggable = "true"; // prevent double init

  let dragSrc = null;

  grid.querySelectorAll(".stat-card").forEach(card => {
    card.draggable = true;

    card.addEventListener("dragstart", () => {
      dragSrc = card;
      card.style.opacity = "0.3";
    });

    card.addEventListener("dragend", () => {
      card.style.opacity = "";
    });

    card.addEventListener("dragover", e => {
      e.preventDefault();
    });

    card.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === card) return;

      const parent = card.parentNode;
      const dragIndex = [...parent.children].indexOf(dragSrc);
      const dropIndex = [...parent.children].indexOf(card);

      if (dragIndex < dropIndex) {
        parent.insertBefore(dragSrc, card.nextSibling);
      } else {
        parent.insertBefore(dragSrc, card);
      }
    });
  });
}

// Detect current mode using button background colors
function detectActiveMode() {
  for (const [id, selectedClass] of Object.entries(MODE_SELECTED_BG)) {
    const btn = document.getElementById(id);
    if (btn && btn.classList.contains(selectedClass)) {
      return id.replace("btn-", "");
    }
  }
  return null;
}

// Get the current stat card order
function getCurrentStatCardOrder() {
  const grid = document.querySelector("#career-stats-content .grid.grid-cols-3");
  if (!grid) return [];
  return [...grid.querySelectorAll(".stat-card")].map(card => {
    const valueEl = card.querySelector("[id^='stat-best-']");
    return valueEl?.id.replace("stat-best-", "") ?? null;
  }).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Leaderboard rank scraper
// ---------------------------------------------------------------------------
function scrapeLeaderboardRank() {
  const tbody = document.getElementById("leaderboard-body");
  if (!tbody) return;

  const playerName = localStorage.getItem("lastPlayerNameCanonical");
  if (!playerName) return;

  // Detect current mode from localStorage or active tab
  const activeMode = detectActiveMode();
  if (!activeMode) return;

  const rows = tbody.querySelectorAll("tr");
  const total = rows.length;

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 2) return;

    const rankCell = cells[0].textContent.trim();
    const nameCell = cells[1].textContent.trim();

    if (nameCell === playerName) {
      // Convert medal emoji to number, or parse directly
      let rank;
      if (rankCell === "🥇") rank = 1;
      else if (rankCell === "🥈") rank = 2;
      else if (rankCell === "🥉") rank = 3;
      else rank = parseInt(rankCell);

      if (!isNaN(rank)) {
        localStorage.setItem(`rankTotal_${activeMode}`, JSON.stringify({ rank, total }));
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Status observer — detects run start, success, DNF, fail
// ---------------------------------------------------------------------------
function initRunTracker() {
  let trackedMode = null;

  const statusEl = document.getElementById("status-message");
  const modalEl  = document.getElementById("success-modal");
  if (!statusEl || !modalEl) return;
  if (statusEl.dataset.tracked) return;
  statusEl.dataset.tracked = "true";

  function onStatusChange() {
    const text = statusEl.textContent.trim();

    if (text === "GO!") {
      runInProgress = true;
      trackedMode = detectActiveMode();
      return;
    }

    if (!runInProgress) return;

    if (text === "Success!") {
      runInProgress = false;
      setTimeout(() => {
        const timeEl = document.getElementById("modal-time");
        const time = parseFloat(timeEl?.textContent?.replace("s", "").trim());
        if (!isNaN(time)) {
          appendRun(trackedMode, time);
          const newBest = updateBestAvg(trackedMode);
          console.log("Displayed newBest: ", newBest);
          const grid = document.querySelector("#success-modal .grid.grid-cols-2.gap-4.mb-6");
          if (grid) {
            if (newBest !== false) {
              const label = MODES_LIST.find(m => m.lsKey === trackedMode)?.label ?? trackedMode;
              let notice = grid.querySelector(".br-avg-best-notice");
              if (!notice) {
                notice = document.createElement("p");
                notice.className = "br-avg-best-notice col-span-2 text-center font-bold text-sm";
                notice.style.color = "#facc15";
                grid.appendChild(notice);
              }
              notice.textContent = newBest !== false ? `New ${label.toLowerCase()} average best of ${newBest.toFixed(3)}s!` : "";
            } else {
              const notice = grid?.querySelector(".br-avg-best-notice");
              if (notice) notice.textContent = "";
            }
          }
        }
      }, 250);
      return;
    }

    if (text.startsWith("Fail") || text === "Press '0' to start") {
      if (!isDuplicateDnf(trackedMode)) appendRun(trackedMode, null, trackedMode);
      runInProgress = false;
      return;
    }
  }

  new MutationObserver(onStatusChange).observe(statusEl, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// ---------------------------------------------------------------------------
// Run history tracking
// ---------------------------------------------------------------------------
const MAX_HISTORY = 100;
let runInProgress = false;

function getRunHistory() {
  try { return JSON.parse(localStorage.getItem("runHistory") || "[]"); }
  catch { return []; }
}

function saveRunHistory(history) {
  localStorage.setItem("runHistory", JSON.stringify(history.slice(-MAX_HISTORY)));
}

function appendRun(mode, time) {
  const history = getRunHistory();
  history.push({ mode, time }); // time is number or null for DNF
  saveRunHistory(history);
}

function computeAo5(runs) {
  // runs is array of 5 { mode, time } — time null = DNF
  const dnfs = runs.filter(r => r.time === null).length;
  if (dnfs > 1) return null;
  const times = runs.map(r => r.time === null ? Infinity : r.time);
  times.sort((a, b) => a - b);
  // Remove best and worst, average middle 3
  const middle = times.slice(1, 4);
  return middle.reduce((a, b) => a + b, 0) / 3;
}

function updateBestAvg(mode) {
  const activeMode = detectActiveMode();
  const history = getRunHistory();
  const lessThan5 = history.length < 5;
  console.log("Less than 5: ", lessThan5);
  if (history.length < 5) return false;

  const last5 = history.slice(-5);
  const allSameMode = last5.every(r => r.mode === last5[0].mode);
  console.log("All same mode: ", allSameMode);
  if (!allSameMode || last5[0].mode !== activeMode) return false;

  const avg = computeAo5(last5);
  console.log("Average: ", avg);
  if (avg === null) return false;

  const best = parseFloat(localStorage.getItem(`bestAvg_${mode}`)) || Infinity;
  console.log(avg, " < ", best, ": ", avg < best);
  if (avg < best) {
    localStorage.setItem(`bestAvg_${mode}`, avg);
    return avg;
  }
  return false;
}

function isDuplicateDnf(mode) {
  const history = getRunHistory();
  const lastTwo = history.slice(-2);
  return lastTwo.length === 2 && lastTwo.every(r => r.mode === mode && r.time === null);
}

function getCurrentAo5Display() {
  const activeMode = detectActiveMode();
  const history = getRunHistory();
  const last5 = history.slice(-5);

  if (last5.length < 5) return "-";

  // All must be same mode and match current
  const allSameMode = last5.every(r => r.mode === last5[0].mode);
  if (!allSameMode || last5[0].mode !== activeMode) return "-";

  const avg = computeAo5(last5);
  return avg !== null ? avg.toFixed(3) : "-";
}

function getAo5Breakdown() {
  const activeMode = detectActiveMode();
  const history = getRunHistory();
  const last5 = history.slice(-5);

  if (last5.length < 5 || !last5.every(r => r.mode === activeMode)) return null;

  const times = last5.map(r => r.time === null ? Infinity : r.time);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  let minMarked = false;
  let maxMarked = false;

  const parts = last5.map(r => {
    const isDnf = r.time === null;
    const value = isDnf ? Infinity : r.time;
    const text = isDnf ? "DNF" : r.time.toFixed(3);
    const isMin = !minMarked && value === minTime;
    const isMax = !maxMarked && value === maxTime;
    if (isMin) minMarked = true;
    if (isMax) maxMarked = true;
    return (isMin || isMax) ? `(${text})` : text;
  });

  return `{${parts.join(", ")}}`;
}

// ---------------------------------------------------------------------------
// Read PBs directly from localStorage (written by the game itself)
// ---------------------------------------------------------------------------
function parsePBsFromDOM() {
  const pbs = {};
  for (const mode of MODES) {
    const raw = localStorage.getItem("bestTime_" + mode.lsKey);
    if (raw !== null) {
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) pbs[mode.lsKey] = val;
    }
  }
  return pbs;
}

// ---------------------------------------------------------------------------
// Convert a raw time (seconds) to a 0–1 skill score
// Higher = better. Uses comparisons to elite times.
// ---------------------------------------------------------------------------
function timeToScore(key, seconds, times) {
  const time = times[key] || 67;
  return Math.min(1, time / seconds);
}

// ---------------------------------------------------------------------------
// Build SVG 9-gon chart — returns a DOM element with interactive tooltips
// ---------------------------------------------------------------------------
function buildChartElement(values, pbs) {
  const n = 9;
  const cx = 160, cy = 160, r = 120;
  const TWO_PI = Math.PI * 2;

  function point(i, scale = 1) {
    const angle = -Math.PI / 2 + TWO_PI * i / n;
    return {
      x: cx + scale * r * Math.cos(angle),
      y: cy + scale * r * Math.sin(angle),
    };
  }

  function polygon(scale) {
    return Array.from({ length: n }, (_, i) => {
      const p = point(i, scale);
      return `${p.x},${p.y}`;
    }).join(" ");
  }

  const outerPts = Array.from({ length: n }, (_, i) => point(i, 1.0));

  const innerPts = Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + TWO_PI * i / n;
    const v = values[i] ?? 0;
    return {
      x: cx + v * r * Math.cos(angle),
      y: cy + v * r * Math.sin(angle),
    };
  });

  const innerPolyStr = innerPts.map(p => `${p.x},${p.y}`).join(" ");

  const radialLines = outerPts.map(p =>
    `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--chart-grid)" stroke-width="1" stroke-opacity="0.5"/>`
  ).join("\n");

  const rings = [0.25, 0.5, 0.75, 1.0].map(s => {
    const opacity = s === 1.0 ? 0.5 : 0.25;
    const dash = s < 1.0 ? 'stroke-dasharray="4,3"' : '';
    return `<polygon points="${polygon(s)}" fill="none" stroke="var(--chart-grid)" stroke-width="1" stroke-opacity="${opacity}" ${dash}/>`;
  }).join("\n");

  const dots = innerPts.map((p, i) =>
    `<circle class="chart-dot" data-index="${i}" cx="${p.x}" cy="${p.y}" r="5" fill="var(--chart-fill)" stroke="var(--chart-bg)" stroke-width="1.5"/>`
  ).join("\n");

  // Invisible larger hit circles for easier hovering
  const hits = innerPts.map((p, i) =>
    `<circle class="chart-hit" data-index="${i}" cx="${p.x}" cy="${p.y}" r="10" fill="transparent" style="cursor:pointer"/>`
  ).join("\n");

  const labels = MODES.map((mode, i) => {
    const p = point(i, 1.2);
    const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
    return `<text x="${p.x}" y="${p.y + 6}" text-anchor="${anchor}" class="chart-label" fill="${mode.color}">${mode.label}</text>`;
  }).join("\n");

  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.display = "inline-block";

  wrap.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" class="skill-svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${rings}
      ${radialLines}
      <polygon points="${innerPolyStr}" fill="var(--chart-fill)" opacity="0.25"/>
      <polygon points="${innerPolyStr}" fill="none" stroke="var(--chart-fill)" stroke-width="2" filter="url(#glow)"/>
      ${dots}
      ${labels}
      ${hits}
    </svg>
    <div class="br-chart-tooltip" id="br-chart-tooltip">
      <div class="br-tooltip-mode"></div>
      <div class="br-tooltip-time"></div>
      <div class="br-tooltip-score"></div>
    </div>
  `;

  const svg = wrap.querySelector("svg");
  const tooltip = wrap.querySelector("#br-chart-tooltip");

  wrap.querySelectorAll(".chart-hit").forEach(el => {
    const i = parseInt(el.dataset.index);
    const mode = MODES[i];
    const raw = pbs[mode.lsKey];
    const score = values[i];
    const pct = score != null ? Math.round(score * 100) : null;

    el.addEventListener("mouseenter", () => {
      wrap.querySelector(`.chart-dot[data-index="${i}"]`).style.filter = "brightness(0.5)";
      tooltip.querySelector(".br-tooltip-mode").textContent = mode.label;
      tooltip.querySelector(".br-tooltip-time").textContent = raw != null ? `Time: ${raw.toFixed(3)}s` : "Time: —";
      tooltip.querySelector(".br-tooltip-score").textContent = pct != null ? `Score: ${pct}%` : "Score: —";
      const svgRect = svg.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      tooltip.style.left = `${elRect.left - svgRect.left + 16}px`;
      tooltip.style.top  = `${elRect.top  - svgRect.top  - 72}px`;
      tooltip.classList.add("visible");
    });

    el.addEventListener("mouseleave", () => {
      wrap.querySelector(`.chart-dot[data-index="${i}"]`).style.filter = "";
      tooltip.classList.remove("visible")
    });
  });

  return wrap;
}

// ---------------------------------------------------------------------------
// Overlay UI
// ---------------------------------------------------------------------------
function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "br-skill-chart-overlay";
  overlay.innerHTML = `
    <div class="br-chart-panel">
      <div class="br-chart-header">
        <span class="br-chart-title">${PANELS[0]}</span>
        <button class="br-chart-close" title="Close">✕</button>
      </div>
      <div class="br-chart-body">
        <button class="br-chart-nav" id="br-chart-prev" title="Previous">&#8249;</button>
        <div class="br-chart-svg-wrap" id="br-chart-svg-wrap">
          <div class="br-chart-empty">No personal bests recorded yet.<br>Play some games to see your chart!</div>
        </div>
        <button class="br-chart-nav" id="br-chart-next" title="Next">&#8250;</button>
      </div>
      <div class="br-chart-footer">
        <button class="br-chart-refresh" id="br-chart-refresh">↻ Refresh</button>
        <span class="br-chart-note"> Based on
        <select class="br-chart-select" id="br-chart-select">
          <option value="wr">WR times</option>
          <option value="elite">top 5% times</option>
          <option value="strong">top 10% times</option>
          <option value="percentile">global percentile</option>
        </select>
        </span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector(".br-chart-close").addEventListener("click", () => {
    overlay.classList.remove("visible");
  });

  document.getElementById("br-chart-refresh").addEventListener("click", refreshChart);
  document.getElementById("br-chart-select").addEventListener("change", refreshChart);

  document.getElementById("br-chart-prev").addEventListener("click", () => {
    showPanel((currentPanel - 1 + PANELS.length) % PANELS.length);
  });

  document.getElementById("br-chart-next").addEventListener("click", () => {
    showPanel((currentPanel + 1) % PANELS.length);
  });

  updateNavButtons();
  return overlay;
}

// ---------------------------------------------------------------------------
// Build skill chart panel
// ---------------------------------------------------------------------------
function refreshChart() {
  const pbs = parsePBsFromDOM();
  const selectedRef = document.getElementById("br-chart-select").value;
  let doubleValues = [];
  if (selectedRef !== "percentile") {
    const reference_times = REFERENCE_TABLES[selectedRef]
    doubleValues = MODES.map(m => {
      if (pbs[m.lsKey] != null) return timeToScore(m.lsKey, pbs[m.lsKey], reference_times);
      return null;
    });
  } else {
    doubleValues = MODES.map(m => {
      const raw = localStorage.getItem(`rankTotal_${m.lsKey}`);
      if (!raw) return null;
      const { rank, total } = JSON.parse(raw);
      if (!total) return null;
      // rank 1 → 1.0, last place → 1 / total (never quite 0)
      return 1 - (rank - 1) / total;
    });
  }

  const hasAny = doubleValues.some(v => v != null);
  const svgWrap = document.getElementById("br-chart-svg-wrap");

  if (!hasAny) {
    svgWrap.innerHTML = `<div class="br-chart-empty">No personal bests recorded yet.<br>Play some games to see your chart!</div>`;
    return;
  }

  const chartValues = doubleValues.map(v => v ?? 0);
  svgWrap.innerHTML = "";
  svgWrap.appendChild(buildChartElement(chartValues, pbs));
}

// ---------------------------------------------------------------------------
// Build global rankings panel
// ---------------------------------------------------------------------------
function rankToDisplay(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

function buildRankingsPanel() {
  const rows = MODES_LIST.map(mode => {
    const timeRaw = localStorage.getItem(`bestTime_${mode.lsKey}`);
    const rankRaw = localStorage.getItem(`rankTotal_${mode.lsKey}`);
    if (!timeRaw || !rankRaw) return null;

    const time = parseFloat(timeRaw);
    const { rank, total } = JSON.parse(rankRaw);

    return `
      <div class="br-lb-row">
        <span class="br-lb-event" style="color: ${MODES.find(m => m.lsKey === mode.lsKey)?.color}">${mode.label}</span>
        <span class="br-lb-time" style="color: ${rank === 1 ? "#ff0000" : MODES.find(m => m.lsKey === mode.lsKey)?.textColor}">${time.toFixed(3)}</span>
        <span class="br-lb-rank" style="color: ${MODES.find(m => m.lsKey === mode.lsKey)?.textColor}">${rankToDisplay(rank)}</span>
      </div>
    `;
  }).filter(Boolean);

  const missingCount = MODES_LIST.length - rows.length;

  return `
    <div class="br-lb-wrap">
      <div class="br-lb-header">
        <span class="br-lb-col">Event</span>
        <span class="br-lb-col">Personal Best</span>
        <span class="br-lb-col">Global Rank</span>
      </div>
      <div class="br-lb-body">
        ${rows.length ? rows.join("") : '<div class="br-lb-empty">No data yet.</div>'}
      </div>
      ${missingCount > 0 ? `
        <div class="br-lb-note">
          ${missingCount} mode${missingCount > 1 ? "s" : ""} missing — visit each mode's leaderboard tab to populate.
        </div>
      ` : ""}
    </div>
  `;
}

function refreshRankings() {
  const svgWrap = document.getElementById("br-chart-svg-wrap");
  svgWrap.innerHTML = buildRankingsPanel();
}

// ---------------------------------------------------------------------------
// Build average tracker panel
// ---------------------------------------------------------------------------
function buildAveragePanel() {
  const activeMode = detectActiveMode();
  const history = getRunHistory();
  const activeModeLabel = MODES_LIST.find(m => m.lsKey === activeMode)?.label ?? "—";
  const ao5 = getCurrentAo5Display(activeMode);
  const ao5breakdown = ao5 === "-" ? "" : getAo5Breakdown();

  // Top section
  const topSection = `
    <div class="br-avg-top">
      <div class="br-avg-current">
        <div class="br-avg-mode-label">${activeModeLabel}</div>
        <div class="br-avg-ao5-value">Ao5: ${ao5}</div>
        ${ao5breakdown ? `<div class="br-avg-ao5-breakdown">${ao5breakdown}</div>` : ""}
      </div>
      <div class="br-avg-history">
        <div class="br-avg-history-header">
          <span>Mode</span><span>Time</span>
        </div>
        <div class="br-avg-history-list">
          ${[...history].reverse().map(r => {
            const label = MODES_LIST.find(m => m.lsKey === r.mode)?.label ?? r.mode;
            const time  = r.time !== null ? r.time.toFixed(3) : "DNF";
            const isDnf = r.time === null;
            return `
              <div class="br-avg-history-row">
                <span class="br-avg-history-mode">${label}</span>
                <span class="br-avg-history-time ${isDnf ? "br-avg-dnf" : ""}">${time}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;

  // Bottom 3x3 grid
  const currentCardOrder = getCurrentStatCardOrder();
  const grid = currentCardOrder.map(statId => {
    const lsKey = statId.replace("stat-best-", "");
    const avg = parseFloat(localStorage.getItem(`bestAvg_${lsKey}`));
    const mode = MODES_LIST.find(m => m.lsKey === lsKey);
    const colors = STAT_CARD_COLORS[mode?.colorType] ?? {};
    return `
      <div class="br-avg-card ${colors.border ?? ""} ${colors.bg ?? ""}">
        <span class="br-avg-card-label ${colors.label ?? ""}">${mode?.label ?? lsKey}</span>
        <span class="br-avg-card-value ${colors.value ?? ""}">${avg ? avg.toFixed(3) : "—"}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="br-avg-wrap">
      ${topSection}
      <div class="br-avg-grid">${grid}</div>
    </div>
  `;
}

function refreshAverage() {
  const svgWrap = document.getElementById("br-chart-svg-wrap");
  svgWrap.innerHTML = buildAveragePanel();
}

// ---------------------------------------------------------------------------
// Toggle button injected into the page
// ---------------------------------------------------------------------------
function injectToggleButton() {
  const btn = document.createElement("button");
  btn.id = "br-skill-chart-btn";
  btn.textContent = "📊 Skill Chart";
  btn.title = "Open Skill Chart overlay";
  document.body.appendChild(btn);
 
  const overlay = createOverlay();
 
  btn.addEventListener("click", () => {
    const visible = overlay.classList.toggle("visible");
    if (visible) {
      showPanel(currentPanel);
    }
  });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
localStorage.removeItem("runHistory");
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectToggleButton);
} else {
  injectToggleButton();
}

cleanLabels();
reorderSpecialPatterns();
reorderStatCards();
makeSpecialPatternsDraggable();
makeStatCardsDraggable();

const domObserver = new MutationObserver(scrapeLeaderboardRank);
domObserver.observe(document.body, { childList: true, subtree: true });
initRunTracker();
