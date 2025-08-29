const formContainer = document.getElementById('form-container');
const logContainer = document.getElementById('log-container');

// Show relevant form based on workout type

function showForm(type) {
  let formHTML = '';

  if (type === 'endurance') {
    formHTML = `
      <h2>Log Endurance Workout</h2>
      <form id="log-form">
        <label>Date:<br><input type="date" name="date" required></label><br><br>

        <label>Modality:<br>
          <select name="modality" required>
            <option value="Running">Running</option>
            <option value="Rowing">Rowing</option>
            <option value="Cycling">Cycling</option>
            <option value="SkiErg">SkiErg</option>
            <option value="Other">Other</option>
          </select>
        </label><br><br>

        <label>Distance (miles or meters):<br><input type="text" name="distance" required></label><br><br>

        <label>Time (hh:mm:ss):<br><input type="text" name="duration" required></label><br><br>

        <label>Effort/Zone:<br><input type="text" name="effort" placeholder="e.g., Zone 2, hard, recovery"></label><br><br>

        <label>Notes:<br><textarea name="notes" rows="3"></textarea></label><br><br>

        <input type="hidden" name="type" value="endurance">
        <button type="submit">Save</button>
      </form>
    `;
  } else if (type === 'strength') {
  formHTML = `
  <h2>Log Strength Workout</h2>
  <form id="log-form">
    <label>Date:<br><input type="date" name="date" required></label><br><br>

    <label>Number of Exercises:<br>
      <select id="exercise-count" name="exerciseCount" required>
        <option value="">Select</option>
        <option value="1">1</option>
        <option value="2" selected>2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
      </select>
    </label>
    <br><br>
    <div id="exercise-fields"></div>

    <label>Notes:<br><textarea name="notes" rows="3"></textarea></label><br><br>
    <input type="hidden" name="type" value="strength">
    <button type="submit">Save</button>
  </form>
`;

} else if (type === 'functional') {
  formHTML = `
    <h2>Log Functional Workout</h2>
    <form id="log-form">
      <label>Date:<br><input type="date" name="date" required></label><br><br>

      <label>Workout Type:<br>
        <select name="format" required>
          <option value="">Select type</option>
          <option value="EMOM">EMOM</option>
          <option value="AMRAP">AMRAP</option>
          <option value="Circuit">Circuit</option>
          <option value="For Time">For Time</option>
        </select>
      </label><br><br>

      <label>Duration or Rounds:<br>
        <input type="text" name="duration" placeholder="e.g., 20 min or 5 rounds" required>
      </label><br><br>

      <label>Exercises:<br>
        <textarea name="exercises" rows="5" placeholder="List exercises here..." required></textarea>
      </label><br><br>

      <label>Notes:<br><textarea name="notes" rows="3"></textarea></label><br><br>

      <input type="hidden" name="type" value="functional">
      <button type="submit">Save</button>
    </form>
  `;
}
formContainer.innerHTML = formHTML;

const exerciseCountSelect = document.getElementById('exercise-count');
if (exerciseCountSelect) {
  exerciseCountSelect.addEventListener('change', function () {
    const count = parseInt(this.value);
    const container = document.getElementById('exercise-fields');
    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
      container.innerHTML += `
        <fieldset>
          <legend>Exercise ${i}</legend>
          <label>Name: <input type="text" name="exercise${i}" required></label><br>
          <label>Sets: <input type="number" name="sets${i}" min="1" required></label><br>
          <label>Reps: <input type="number" name="reps${i}" min="1" required></label><br>
          <label>Load: <input type="text" name="load${i}" placeholder="e.g., 135 lbs or BW"></label><br>
        </fieldset><br>
      `;
    }
  });

  // Trigger it once so fields show on form load
  exerciseCountSelect.dispatchEvent(new Event('change'));
}

document.getElementById('log-form').addEventListener('submit', saveWorkout);




  
}

// Save to localStorage
function saveWorkout(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const type = formData.get('type');

  let entry = {
    date: formData.get('date'),
    type,
    notes: formData.get('notes')
  };

  if (type === 'endurance') {
    entry.modality = formData.get('modality');
    entry.distance = formData.get('distance');
    entry.duration = formData.get('duration');
    entry.effort = formData.get('effort');
  } else if (type === 'strength') {
    const exerciseCount = parseInt(formData.get('exerciseCount')) || 0;
    entry.exercises = [];

  for (let i = 1; i <= exerciseCount; i++) {
    const name = formData.get(`exercise${i}`);
    const sets = formData.get(`sets${i}`);
    const reps = formData.get(`reps${i}`);
    const load = formData.get(`load${i}`);

    // Only add exercises that have at least one field filled
    if (name || sets || reps || load) {
      entry.exercises.push({ name, sets, reps, load });
    }
  }
  // End of strength block
} else if (type === 'functional') {
  entry = {
    date: formData.get('date'),
    type,
    format: formData.get('format'),
    duration: formData.get('duration'),
    exercises: formData.get('exercises'),
    notes: formData.get('notes')
  };
}


  const logs = JSON.parse(localStorage.getItem('trainingLogs')) || [];
  logs.push(entry);
  localStorage.setItem('trainingLogs', JSON.stringify(logs));
  showLog();
  formContainer.innerHTML = '';
}


// Display log
function showLog() {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  const logs = JSON.parse(localStorage.getItem('trainingLogs')) || [];
  logContainer.innerHTML = `<h2>Workout Log</h2>`;
  if (logs.length === 0) {
    logContainer.innerHTML += '<p>No entries yet.</p>';
    return;
  }

  logs.slice().reverse().forEach((log, index) => {
    const logId = `log-${index}`;
    let summary = `${log.date} - ${log.type.charAt(0).toUpperCase() + log.type.slice(1)}`;

    let details = '';
    if (log.type === 'endurance') {
      details = `
        <div><strong>Modality:</strong> ${log.modality || '-'}</div>
        <div><strong>Distance:</strong> ${log.distance || '-'}</div>
        <div><strong>Duration:</strong> ${log.duration || '-'}</div>
        <div><strong>Effort/Zone:</strong> ${log.effort || '-'}</div>
        ${log.notes ? `<em>Notes: ${log.notes}</em>` : ''}
      `;
    } else if (log.type === 'strength') {
      let exercisesHTML = '';
      if (log.exercises && Array.isArray(log.exercises)) {
        log.exercises.forEach((ex, i) => {
          exercisesHTML += `<div><strong>Exercise ${i + 1}:</strong> ${ex.name || '-'} | Sets: ${ex.sets || '-'}, Reps: ${ex.reps || '-'}, Load: ${ex.load || '-'}</div>`;
        });
      }
      details = `${exercisesHTML}${log.notes ? `<em>Notes: ${log.notes}</em>` : ''}`;
    } else if (log.type === 'functional') {
      details = `
        <div><strong>Type:</strong> ${log.format || '-'}</div>
        <div><strong>Duration / Rounds:</strong> ${log.duration || '-'}</div>
        <div><strong>Exercises:</strong><pre>${log.exercises || '-'}</pre></div>
        ${log.notes ? `<em>Notes: ${log.notes}</em>` : ''}
      `;
    }

    logContainer.innerHTML += `
      <div style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding: 10px;">
        <button class="toggle-details" data-target="${logId}">${summary}</button>
        <div id="${logId}" class="log-details" style="display:none; margin-top:10px;">
          ${details}
        </div>
      </div>
    `;
  });

  // Attach toggle functionality
  const toggleButtons = document.querySelectorAll('.toggle-details');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target.style.display === 'none') {
        target.style.display = 'block';
      } else {
        target.style.display = 'none';
      }
    });
  });
}




document.addEventListener('DOMContentLoaded', () => {
  const strengthBtn = document.getElementById('log-strength');
  const functionalBtn = document.getElementById('log-functional');
  const enduranceBtn = document.getElementById('log-endurance');

  if (strengthBtn) strengthBtn.addEventListener('click', () => showForm('strength'));
  if (functionalBtn) functionalBtn.addEventListener('click', () => showForm('functional'));
  if (enduranceBtn) enduranceBtn.addEventListener('click', () => showForm('endurance'));

  showLog();
});

// At the bottom of your script or in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  showForm("endurance");  // or "strength" or "functional"
});




