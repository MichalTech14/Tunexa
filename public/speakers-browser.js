async function fetchSpeakers() {
  const res = await fetch('/api/vehicle-speakers');
  if (!res.ok) return [];
  const data = await res.json();
  return data.entries || [];
}

function groupByBrand(entries) {
  const brands = {};
  for (const entry of entries) {
    if (!brands[entry.vehicleType]) brands[entry.vehicleType] = [];
    brands[entry.vehicleType].push(entry);
  }
  return brands;
}

function groupByModel(entries) {
  const models = {};
  for (const entry of entries) {
    if (!models[entry.model]) models[entry.model] = [];
    models[entry.model].push(entry);
  }
  return models;
}

function createAccordion(brands) {
  const container = document.getElementById('speakersAccordion');
  container.innerHTML = '';
  Object.entries(brands).forEach(([brand, brandEntries]) => {
    const brandDiv = document.createElement('div');
    brandDiv.className = 'brand';
    const brandBtn = document.createElement('button');
    brandBtn.textContent = `🏢 ${brand}`;
    brandBtn.onclick = () => {
      brandDiv.classList.toggle('open');
      if (brandDiv.classList.contains('open')) {
        showModels(brandDiv, brandEntries);
      } else {
        removeChildren(brandDiv, 1);
      }
    };
    brandDiv.appendChild(brandBtn);
    container.appendChild(brandDiv);
  });
}

function showModels(brandDiv, brandEntries) {
  removeChildren(brandDiv, 1);
  const models = groupByModel(brandEntries);
  Object.entries(models).forEach(([model, modelEntries]) => {
    const modelDiv = document.createElement('div');
    modelDiv.className = 'model';
    const modelBtn = document.createElement('button');
    modelBtn.textContent = `🚗 ${model}`;
    modelBtn.onclick = () => {
      modelDiv.classList.toggle('open');
      if (modelDiv.classList.contains('open')) {
        showGenerations(modelDiv, modelEntries);
      } else {
        removeChildren(modelDiv, 1);
      }
    };
    modelDiv.appendChild(modelBtn);
    brandDiv.appendChild(modelDiv);
  });
}

function showGenerations(modelDiv, modelEntries) {
  removeChildren(modelDiv, 1);
  modelEntries.forEach((entry) => {
    const genDiv = document.createElement('div');
    genDiv.className = 'generation';
    const genBtn = document.createElement('button');
    genBtn.textContent = `📅 ${entry.generation || 'Generácia neznáma'}`;
    genBtn.onclick = () => {
      genDiv.classList.toggle('open');
      if (genDiv.classList.contains('open')) {
        showDetails(genDiv, entry);
      } else {
        removeChildren(genDiv, 1);
      }
    };
    genDiv.appendChild(genBtn);
    modelDiv.appendChild(genDiv);
  });
}

function showDetails(genDiv, entry) {
  removeChildren(genDiv, 1);
  const details = document.createElement('div');
  details.className = 'details';
  details.innerHTML = `
    <div class="system">
      <span class="system-title">📦 Základný systém:</span> ${entry.basicSystem || 'Neznámy'}<br>
      <span>Počet: ${entry.basicCount || '?'} reproduktorov</span>
    </div>
    <div class="system">
      <span class="system-title">💎 Prémiový systém:</span> ${entry.speakerType || 'Neznámy'}<br>
      <span>Počet: ${entry.speakerCount || '?'} reproduktorov</span>
    </div>
    <div class="years">Roky: ${entry.years || 'Neznáme'}</div>
    <div class="gen">Generácia: ${entry.generation || 'Neznáma'}</div>
  `;
  // Pridaj tlačidlo na meranie cez mikrofón
  const measureBtn = document.createElement('button');
  measureBtn.textContent = '🎤 Spustiť meranie cez mikrofón';
  measureBtn.style.marginTop = '1em';
  measureBtn.style.background = '#7ca1e6';
  measureBtn.style.color = '#fff';
  measureBtn.style.border = 'none';
  measureBtn.style.padding = '0.7em 1.2em';
  measureBtn.style.borderRadius = '6px';
  measureBtn.style.fontSize = '1em';
  measureBtn.style.cursor = 'pointer';
  measureBtn.onclick = () => {
    // Redirect na meraciu stránku s parametrom vozidla
    const params = new URLSearchParams({
      brand: entry.vehicleType || '',
      model: entry.model || '',
      generation: entry.generation || '',
    });
    window.location.href = `/audio-certification?${params.toString()}`;
  };
  details.appendChild(measureBtn);
  genDiv.appendChild(details);
}

function removeChildren(parent, fromIdx) {
  while (parent.children.length > fromIdx) parent.removeChild(parent.lastChild);
}

window.addEventListener('DOMContentLoaded', async () => {
  const entries = await fetchSpeakers();
  const brands = groupByBrand(entries);
  createAccordion(brands);
});
