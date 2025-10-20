function getBluetoothId() {
  let btId = localStorage.getItem('tunexa_bt_id');
  if (!btId) {
    btId = 'BT-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    localStorage.setItem('tunexa_bt_id', btId);
  }
  return btId;
}

function loadMeasurements() {
  const btId = getBluetoothId();
  const data = localStorage.getItem(`tunexa_measure_${btId}`);
  const list = document.getElementById('measurementsList');
  list.innerHTML = '';
  if (data) {
    const m = JSON.parse(data);
    const li = document.createElement('li');
    li.textContent = `${m.brand} ${m.model} (${m.generation}) – ${m.duration}s, dBA: ${m.measured ? m.measured.dBA : 'n/a'} (${m.timestamp})`;
    list.appendChild(li);
  } else {
    const li = document.createElement('li');
    li.textContent = 'Žiadne merania.';
    list.appendChild(li);
  }
}

function exportMeasurements() {
  const btId = getBluetoothId();
  const data = localStorage.getItem(`tunexa_measure_${btId}`);
  if (!data) return alert('Žiadne merania na export.');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tunexa_meranie_${btId}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}

window.addEventListener('DOMContentLoaded', () => {
  loadMeasurements();
  document.getElementById('exportBtn').onclick = exportMeasurements;
});
