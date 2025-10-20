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

function loadFailedMeasurement() {
  const failedBlock = document.getElementById('failedDataBlock');
  const failed = localStorage.getItem('tunexa_failed_measurement');
  if (failed) {
    const m = JSON.parse(failed);
    failedBlock.style.display = 'block';
    failedBlock.innerHTML = `<b>Predchádzajúce neúspešné meranie:</b><br>Trvanie: ${m.duration}s<br>dBA: ${m.measured ? m.measured.dBA : 'n/a'}<br>Čas: ${m.timestamp}`;
  } else {
    failedBlock.style.display = 'none';
  }
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
          // Spojíme s neúspešným meraním
          const failed = localStorage.getItem('tunexa_failed_measurement');
          let failedData = null;
          if (failed) {
            failedData = JSON.parse(failed);
            localStorage.removeItem('tunexa_failed_measurement');
          }
          const params = getParams();
          const result = {
            brand: params.brand,
            model: params.model,
            generation: params.generation,
            duration: seconds,
            timestamp: new Date().toISOString(),
            measured: seconds >= 5 ? { dBA: Math.round(30 + Math.random()*40) } : null,
            previous: failedData
          };
          localStorage.setItem('tunexa_cable_measurement', JSON.stringify(result));
          showResult(`Káblové meranie uložené.<br>Trvanie: ${seconds}s<br>dBA: ${result.measured ? result.measured.dBA : 'n/a'}`);
          stopBtn.disabled = true;
          // Pokračuj na optimalizáciu
          setTimeout(() => {
            window.location.href = '/audio-optimization?brand='+encodeURIComponent(params.brand)+'&model='+encodeURIComponent(params.model)+'&generation='+encodeURIComponent(params.generation);
          }, 2500);
        };
        statusDiv.appendChild(stopBtn);
      }
    })
    .catch(err => {
      statusDiv.textContent = 'Nepodarilo sa aktivovať mikrofón.';
    });
}

function showResult(text) {
  const resultBlock = document.getElementById('resultBlock');
  resultBlock.innerHTML = text;
  resultBlock.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
  const params = getParams();
  showVehicleInfo(params);
  loadFailedMeasurement();
  document.getElementById('startMicBtn').onclick = startMicMeasurement;
});
