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

function startOptimization() {
  const optBtn = document.getElementById('startOptBtn');
  const resultBlock = document.getElementById('optResultBlock');
  optBtn.disabled = true;
  resultBlock.style.display = 'block';
  resultBlock.innerHTML = 'Analyzujem dáta a pripravujem odporúčania...';
  setTimeout(() => {
    // Simulácia odporúčaní
    resultBlock.innerHTML = '<b>Odporúčanie:</b><br>Navýšte basy o +2dB<br>Znížte výšky o -1dB<br>Skontrolujte polohu zadných reproduktorov.';
  }, 2500);
}

window.addEventListener('DOMContentLoaded', () => {
  const params = getParams();
  showVehicleInfo(params);
  document.getElementById('startOptBtn').onclick = startOptimization;
});
