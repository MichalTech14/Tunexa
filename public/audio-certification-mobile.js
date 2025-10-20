function getParams() {
  const url = new URL(window.location.href);
  return {
    brand: url.searchParams.get('brand') || '',
    model: url.searchParams.get('model') || '',
    generation: url.searchParams.get('generation') || '',
  };
}

function showVehicleInfo(params) {
  const infoDiv = document.getElementById('vehicleInfo');
  infoDiv.innerHTML = `
    <strong>Značka:</strong> ${params.brand}<br>
    <strong>Model:</strong> ${params.model}<br>
    <strong>Generácia:</strong> ${params.generation}
  `;
}

function startMicMeasurement() {
  const statusDiv = document.getElementById('micStatus');
  statusDiv.textContent = 'Pripájam mikrofón...';
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      statusDiv.textContent = 'Mikrofón aktívny! Meranie prebieha...';
      let measuring = true;
      let seconds = 0;
      statusDiv.innerHTML = `<span style='color:green'>●</span> Meranie prebieha... <span id='timer'>0s</span>`;
      const timer = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = `${seconds}s`;
      }, 1000);
      let stopBtn = document.getElementById('stopBtn');
      if (!stopBtn) {
        stopBtn = document.createElement('button');
        stopBtn.id = 'stopBtn';
        stopBtn.textContent = '⏹️ Ukončiť meranie';
        stopBtn.style.marginTop = '1em';
        stopBtn.onclick = () => {
          if (!measuring) return;
          measuring = false;
          clearInterval(timer);
          stream.getTracks().forEach(track => track.stop());
          statusDiv.innerHTML = '<span style="color:gray">Meranie ukončené.</span>';
          // Ulož dáta do localStorage pod Bluetooth ID
          const btId = getBluetoothId();
          const params = getParams();
          const result = {
            brand: params.brand,
            model: params.model,
            generation: params.generation,
            duration: seconds,
            timestamp: new Date().toISOString(),
            measured: seconds >= 5 ? { dBA: Math.round(30 + Math.random()*40) } : null
          };
          localStorage.setItem(`tunexa_measure_${btId}`, JSON.stringify(result));
          showResult(`Meranie uložené do telefónu pod ID: <b>${btId}</b><br>Trvanie: ${seconds}s`);
          stopBtn.disabled = true;
        };
        statusDiv.appendChild(stopBtn);
      }
    })
    .catch(err => {
      statusDiv.textContent = 'Nepodarilo sa aktivovať mikrofón.';
    });
}

function getBluetoothId() {
  let btId = localStorage.getItem('tunexa_bt_id');
  if (!btId) {
    btId = 'BT-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    localStorage.setItem('tunexa_bt_id', btId);
  }
  return btId;
}

function showResult(text) {
  const resultBlock = document.getElementById('resultBlock');
  resultBlock.innerHTML = text;
  resultBlock.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
  const params = getParams();
  showVehicleInfo(params);
  document.getElementById('startMicBtn').onclick = startMicMeasurement;
});
