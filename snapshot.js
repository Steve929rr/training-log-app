function parseDate(str) {
  // your logs use YYYY-MM-DD format
  return new Date(str);
}

function getLogsWithinDays(days) {
  const logs = JSON.parse(localStorage.getItem("trainingLogs")) || [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return logs.filter(log => parseDate(log.date) >= cutoff);
}

function summarizeLogs(logs) {
  const summary = {
    endurance: {},       // { run: miles, bike: miles }
    strength: { sessions: 0, sets: 0 },
    functional: { sessions: 0, formats: {} }
  };

  logs.forEach(log => {
    if (log.type === "endurance") {
      const modality = (log.modality || "Other").toLowerCase();
      const distance = parseFloat(log.distance) || 0;
      summary.endurance[modality] = (summary.endurance[modality] || 0) + distance;
    } 
    else if (log.type === "strength") {
      summary.strength.sessions++;
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach(ex => {
          if (ex.sets) summary.strength.sets += parseInt(ex.sets) || 0;
        });
      }
    } 
    else if (log.type === "functional") {
      summary.functional.sessions++;
      const format = (log.format || "Other").toLowerCase();
      summary.functional.formats[format] = (summary.functional.formats[format] || 0) + 1;
    }
  });

  return summary;
}

function displaySummary(days, container) {
  const logs = getLogsWithinDays(days);
  const summary = summarizeLogs(logs);

  let html = `<h2>Last ${days} Days</h2>`;
  html += `<div class="snapshot-columns">`;

  // Endurance Column
  html += `<div class="snapshot-column"><h3>Endurance</h3>`;
  if (Object.keys(summary.endurance).length === 0) {
    html += `- None<br>`;
  } else {
    for (const [modality, dist] of Object.entries(summary.endurance)) {
      html += `${modality} — ${dist} miles/km<br>`;
    }
  }
  html += `</div>`;

  // Strength Column
  html += `<div class="snapshot-column"><h3>Strength</h3>`;
  if (summary.strength.sessions === 0) {
    html += `- None<br>`;
  } else {
    html += `${summary.strength.sessions} sessions, ${summary.strength.sets} sets<br>`;
  }
  html += `</div>`;

  // Functional Column
  html += `<div class="snapshot-column"><h3>Functional</h3>`;
  if (summary.functional.sessions === 0) {
    html += `- None<br>`;
  } else {
    html += `${summary.functional.sessions} sessions<br>`;
    for (const [format, count] of Object.entries(summary.functional.formats)) {
      html += `• ${count} ${format}<br>`;
    }
  }
  html += `</div>`; // end of functional column

  html += `</div>`; // end of snapshot-columns
  container.innerHTML += `<div class="snapshot-block">${html}</div>`;
}



document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("snapshot-results");
  displaySummary(7, container);
  displaySummary(30, container);
});
