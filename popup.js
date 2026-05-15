// popup.js
const TARGET = "devcamp.studio/playground/champ/binary-online_game";
 
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const area = document.getElementById("action-area");
  const onSite = tab && tab.url && tab.url.includes(TARGET);
 
  if (onSite) {
    const btn = document.createElement("button");
    btn.className = "open-btn";
 
    // Set initial button text based on current overlay state
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.getElementById("br-skill-chart-overlay")?.classList.contains("visible"),
    }, (results) => {
      const isOpen = results?.[0]?.result;
      btn.textContent = isOpen ? "↙ CLOSE SKILL CHART" : "↗ OPEN SKILL CHART";
      area.appendChild(btn);
    });
 
    btn.addEventListener("click", () => {
      // Click the injected button on the page
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const btn = document.getElementById("br-skill-chart-btn");
          if (btn) btn.click();
        }
      });
      window.close();
    });
  } else {
    const msg = document.createElement("div");
    msg.className = "disabled-btn";
    msg.textContent = "⚠ NOT ON BINARYRANKED SITE";
    area.appendChild(msg);
  }
});
