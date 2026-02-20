// =============================================
// MEDSCAN — COMPLETE FRONTEND SCRIPT
// Features: Search, Dark Mode, Favourites,
// Compare, Dosage Calc, Pill ID, Interactions
// =============================================

// =====================
// STATE
// =====================
let currentMedicine = null;
let compareList = [];
let pillSelections = { shape: null, color: null };
let interactionMeds = [];

const POPULAR_MEDS = [
  "ibuprofen", "acetaminophen", "aspirin", "amoxicillin",
  "metformin", "lisinopril", "atorvastatin", "omeprazole",
  "metoprolol", "levothyroxine", "amlodipine", "gabapentin",
  "hydrochlorothiazide", "sertraline", "losartan", "pantoprazole"
];

// =====================
// THEME
// =====================
function initTheme() {
  const saved = localStorage.getItem('medscan-theme') || 'light';
  setTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('medscan-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀' : '🌙';
}

// =====================
// JARGON MAP
// =====================
const jargonMap = {
  "myalgia": "muscle pain", "nausea": "feeling sick", "dyspepsia": "indigestion",
  "pruritus": "itching", "erythema": "skin redness", "edema": "swelling",
  "tachycardia": "fast heartbeat", "hypotension": "low blood pressure",
  "hypertension": "high blood pressure", "somnolence": "drowsiness",
  "contraindicated": "should not be used", "hepatic": "liver-related",
  "renal": "kidney-related", "anaphylaxis": "severe allergic reaction",
  "thrombosis": "blood clot", "arrhythmia": "irregular heartbeat",
  "dyspnea": "difficulty breathing", "flatulence": "gas", "alopecia": "hair loss",
  "vertigo": "dizziness", "insomnia": "difficulty sleeping", "pyrexia": "fever",
  "arthralgia": "joint pain", "rhinitis": "runny nose", "urticaria": "hives",
  "xerostomia": "dry mouth", "epistaxis": "nosebleed", "syncope": "fainting",
  "palpitations": "irregular heartbeat sensation", "diarrhea": "loose stools",
  "dysphagia": "difficulty swallowing", "tinnitus": "ringing in ears",
  "paresthesia": "tingling or numbness", "diaphoresis": "excessive sweating",
  "bradycardia": "slow heartbeat", "emesis": "vomiting", "asthenia": "weakness",
  "diplopia": "double vision", "dysuria": "painful urination"
};

function simplifyJargon(text) {
  if (!text || text === "Not available") return "Not available";
  let result = text;
  Object.entries(jargonMap).forEach(([medical, plain]) => {
    const regex = new RegExp(`\\b${medical}\\b`, "gi");
    result = result.replace(regex, `${medical} (${plain})`);
  });
  return result;
}

// =====================
// SAFETY BADGE
// =====================
function getSafetyBadge(data) {
  const text = ((data.warnings || "") + " " + (data.sideEffects || "")).toLowerCase();
  if (text.includes("death") || text.includes("fatal") || text.includes("life-threatening") || text.includes("serious") || text.includes("severe")) {
    return { label: "⚠ Use With Caution", color: "var(--accent)", bg: "var(--accent-bg)" };
  } else if (text.includes("consult") || text.includes("avoid") || text.includes("risk") || text.includes("caution")) {
    return { label: "◈ Moderate Risk", color: "var(--amber)", bg: "var(--amber-bg)" };
  } else {
    return { label: "✓ Generally Safe", color: "var(--green)", bg: "var(--green-bg)" };
  }
}

// =====================
// RECENT SEARCHES
// =====================
function saveToRecent(name) {
  let recent = getRecent();
  recent = [name, ...recent.filter(n => n.toLowerCase() !== name.toLowerCase())].slice(0, 6);
  localStorage.setItem("medscan-recent", JSON.stringify(recent));
  renderRecent();
}

function getRecent() {
  try { return JSON.parse(localStorage.getItem("medscan-recent") || "[]"); }
  catch { return []; }
}

function renderRecent() {
  const recent = getRecent();
  const container = document.getElementById("recentSearches");
  if (recent.length === 0) { container.innerHTML = ""; return; }
  container.innerHTML =
    `<span class="recent-label">Recent</span>` +
    recent.map(name =>
      `<span class="recent-chip" onclick="quickSearch('${name}')">${name}</span>`
    ).join("");
}

function quickSearch(name) {
  document.getElementById("searchInput").value = name;
  handleSearch();
}

// =====================
// AUTOCOMPLETE
// =====================
let autocompleteTimeout;

document.getElementById("searchInput").addEventListener("input", function () {
  clearTimeout(autocompleteTimeout);
  const val = this.value.trim().toLowerCase();
  const dropdown = document.getElementById("autocomplete");

  if (val.length < 2) { dropdown.classList.add("hidden"); return; }

  autocompleteTimeout = setTimeout(() => {
    const matches = POPULAR_MEDS.filter(m => m.startsWith(val) && m !== val).slice(0, 5);
    if (matches.length === 0) { dropdown.classList.add("hidden"); return; }
    dropdown.innerHTML = matches.map(m =>
      `<div class="autocomplete-item" onclick="quickSearch('${m}')">${m}</div>`
    ).join("");
    dropdown.classList.remove("hidden");
  }, 200);
});

document.addEventListener("click", function (e) {
  if (!e.target.closest(".search-wrap")) {
    document.getElementById("autocomplete").classList.add("hidden");
  }
});

document.getElementById("searchInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") handleSearch();
});

// =====================
// FDA FETCH
// =====================
async function fetchFromFDA(searchType, name) {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.${searchType}:"${encodeURIComponent(name)}"&limit=1`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();
    if (data.error || !data.results?.length) return null;
    return data.results[0];
  } catch { return null; }
}

async function searchMedicine(name) {
  const n = name.trim();
  let result = await fetchFromFDA("brand_name", n)
    || await fetchFromFDA("generic_name", n)
    || await fetchFromFDA("substance_name", n);
  if (!result) return null;
  return parseMedicineData(result);
}

function parseMedicineData(result) {
  return {
    name: result.openfda?.brand_name?.[0] || result.openfda?.generic_name?.[0] || "Unknown Medicine",
    genericName: result.openfda?.generic_name?.[0] || "Not available",
    manufacturer: result.openfda?.manufacturer_name?.[0] || "Not available",
    purpose: result.indications_and_usage?.[0] || result.purpose?.[0] || "Not available",
    ingredients: result.active_ingredient?.[0] || result.spl_product_data_elements?.[0] || "Not available",
    sideEffects: result.adverse_reactions?.[0] || result.side_effects?.[0] || "Not available",
    warnings: result.boxed_warning?.[0] || result.warnings?.[0] || result.warnings_and_cautions?.[0] || "Not available",
    interactions: result.drug_interactions?.[0] || "Not available",
    dosage: result.dosage_and_administration?.[0] || "Not available",
    whoShouldAvoid: result.contraindications?.[0] || result.when_using?.[0] || "Not available"
  };
}

// =====================
// MAIN SEARCH
// =====================
async function handleSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const name = input.value.trim();

  if (!name) { showToast("Please enter a medicine name"); return; }

  document.getElementById("autocomplete").classList.add("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("error").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");

  btn.disabled = true;
  btn.textContent = "Searching...";

  try {
    const data = await searchMedicine(name);

    document.getElementById("loading").classList.add("hidden");
    btn.disabled = false;
    btn.textContent = "Analyze";

    if (!data) {
      document.getElementById("error").classList.remove("hidden");
      return;
    }

    currentMedicine = data;
    displayResults(data);
    saveToRecent(name);

    // Reset interaction list with current medicine
    interactionMeds = [data.name];
    renderInteractionList();

  } catch (err) {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
    btn.disabled = false;
    btn.textContent = "Analyze";
    console.error(err);
  }
}

// =====================
// DISPLAY
// =====================
function displayResults(data) {
  document.getElementById("medicineName").textContent = data.name;
  document.getElementById("genericName").textContent = `Generic: ${data.genericName}`;
  document.getElementById("manufacturer").textContent = `By ${data.manufacturer}`;

  const badge = getSafetyBadge(data);
  const badgeEl = document.getElementById("safetyBadge");
  badgeEl.textContent = badge.label;
  badgeEl.style.background = badge.bg;
  badgeEl.style.color = badge.color;
  badgeEl.style.borderColor = badge.color;

  // Overview
  document.getElementById("purpose").textContent = data.purpose;
  document.getElementById("ingredients").textContent = data.ingredients;

  // Safety
  document.getElementById("sideEffects").textContent = simplifyJargon(data.sideEffects);
  document.getElementById("warnings").textContent = simplifyJargon(data.warnings);
  document.getElementById("interactions").textContent = data.interactions;
  document.getElementById("whoShouldAvoid").textContent = data.whoShouldAvoid;

  // Dosage
  document.getElementById("dosage").textContent = data.dosage;

  // Fav button state
  updateFavBtn(data.name);

  // Switch to overview tab
  switchTab('overview');

  document.getElementById("results").classList.remove("hidden");
  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

// =====================
// TABS
// =====================
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', c.id !== `tab-${name}`);
    if (c.id === `tab-${name}`) c.classList.remove('hidden');
  });
}

// =====================
// DOSAGE CALCULATOR
// =====================
function calcDose() {
  const weightRaw = parseFloat(document.getElementById("calcWeight").value);
  const unit = document.getElementById("calcUnit").value;
  const mgKg = parseFloat(document.getElementById("calcMgKg").value);
  const freq = parseInt(document.getElementById("calcFreq").value);
  const resultEl = document.getElementById("calcResult");

  if (!weightRaw || !mgKg) { resultEl.classList.add("hidden"); return; }

  const weightKg = unit === "lbs" ? weightRaw * 0.453592 : weightRaw;
  const single = (weightKg * mgKg).toFixed(1);
  const daily = (weightKg * mgKg * freq).toFixed(1);

  document.getElementById("singleDose").textContent = `${single} mg`;
  document.getElementById("dailyDose").textContent = `${daily} mg`;
  resultEl.classList.remove("hidden");
}

// =====================
// PILL IDENTIFIER
// =====================
function selectPillOpt(el, type) {
  el.closest('.pill-options').querySelectorAll('.pill-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  pillSelections[type] = el.dataset.val;
}

function identifyPill() {
  const shape = pillSelections.shape;
  const color = pillSelections.color;
  const imprint = document.getElementById("pillImprint").value.trim().toUpperCase();
  const resultEl = document.getElementById("pillResult");

  if (!shape && !color && !imprint) {
    showToast("Select at least one characteristic");
    return;
  }

  resultEl.classList.remove("hidden");

  if (imprint) {
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(imprint)}&limit=3`;
    resultEl.innerHTML = `<strong>Searching for imprint "${imprint}"...</strong>`;

    fetch(fdaUrl)
      .then(r => r.json())
      .then(data => {
        if (data.results?.length) {
          const matches = data.results.map(r =>
            r.openfda?.brand_name?.[0] || r.openfda?.generic_name?.[0] || "Unknown"
          ).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
          resultEl.innerHTML = `
            <strong>Possible matches for imprint "${imprint}":</strong><br>
            ${matches.join(", ")}<br><br>
            <em style="font-size:0.78rem;opacity:0.7">Always verify with a pharmacist.</em>
          `;
        } else {
          resultEl.innerHTML = buildPillDescription(shape, color, imprint);
        }
      })
      .catch(() => {
        resultEl.innerHTML = buildPillDescription(shape, color, imprint);
      });
  } else {
    resultEl.innerHTML = buildPillDescription(shape, color, imprint);
  }
}

function buildPillDescription(shape, color, imprint) {
  let desc = [];
  if (color) desc.push(color);
  if (shape) desc.push(shape);
  const descStr = desc.join(", ") || "pill";
  return `
    <strong>Description:</strong> ${descStr}${imprint ? `, imprint: ${imprint}` : ''}<br><br>
    For accurate identification, visit 
    <a href="https://pillidentifier.drugs.com" target="_blank" style="color:var(--accent)">drugs.com/pill-identifier</a> or 
    <a href="https://www.rxlist.com/pill-identification-tool/article.htm" target="_blank" style="color:var(--accent)">rxlist.com</a>.<br><br>
    <em style="font-size:0.78rem;opacity:0.7">Always confirm with a pharmacist before taking any unidentified pill.</em>
  `;
}

// =====================
// INTERACTION CHECKER
// =====================
function renderInteractionList() {
  const container = document.getElementById("interactionList");
  if (interactionMeds.length === 0) { container.innerHTML = ""; return; }
  container.innerHTML = interactionMeds.map((med, i) =>
    `<span class="interaction-tag">
      ${med}
      ${i > 0 ? `<button onclick="removeInteractionMed(${i})">×</button>` : ''}
    </span>`
  ).join("");
}

function addInteractionMed() {
  const input = document.getElementById("interactionInput");
  const name = input.value.trim();
  if (!name) return;
  if (interactionMeds.map(m => m.toLowerCase()).includes(name.toLowerCase())) {
    showToast("Already added");
    return;
  }
  interactionMeds.push(name);
  input.value = "";
  renderInteractionList();
}

function removeInteractionMed(i) {
  interactionMeds.splice(i, 1);
  renderInteractionList();
}

async function checkInteractions() {
  if (interactionMeds.length < 2) {
    showToast("Add at least one more medicine to check");
    return;
  }

  const resultEl = document.getElementById("interactionResult");
  resultEl.className = "interaction-result warning";
  resultEl.classList.remove("hidden");
  resultEl.innerHTML = "Checking...";

  const others = interactionMeds.slice(1);
  let foundInteractions = [];

  for (const med of others) {
    const result = await fetchFromFDA("generic_name", med) || await fetchFromFDA("brand_name", med);
    if (result?.drug_interactions?.[0]) {
      const interaction = result.drug_interactions[0];
      const currentName = currentMedicine?.name?.toLowerCase() || "";
      if (currentName && interaction.toLowerCase().includes(currentName)) {
        foundInteractions.push({ med, note: interaction.slice(0, 300) + "..." });
      }
    }
  }

  if (foundInteractions.length > 0) {
    resultEl.className = "interaction-result warning";
    resultEl.innerHTML = `<strong>⚠ Potential interaction detected:</strong><br><br>` +
      foundInteractions.map(f => `<strong>${f.med}</strong>: ${f.note}`).join("<br><br>") +
      `<br><br><em style="font-size:0.78rem">Always consult your doctor or pharmacist.</em>`;
  } else {
    resultEl.className = "interaction-result safe";
    resultEl.innerHTML = `<strong>✓ No major interactions found</strong> in the FDA database.<br><br>
      <em style="font-size:0.78rem">Consult your pharmacist for a full review.</em>`;
  }
}

// =====================
// FAVOURITES
// =====================
function getFavourites() {
  try { return JSON.parse(localStorage.getItem("medscan-favs") || "[]"); }
  catch { return []; }
}

function saveFavourites(favs) {
  localStorage.setItem("medscan-favs", JSON.stringify(favs));
  updateFavCount();
  renderFavList();
}

function toggleFavourite() {
  if (!currentMedicine) return;
  let favs = getFavourites();
  const exists = favs.find(f => f.name === currentMedicine.name);
  if (exists) {
    favs = favs.filter(f => f.name !== currentMedicine.name);
    showToast("Removed from saved");
  } else {
    favs.unshift({ name: currentMedicine.name, genericName: currentMedicine.genericName });
    showToast("♥ Saved!");
  }
  saveFavourites(favs);
  updateFavBtn(currentMedicine.name);
}

function updateFavBtn(name) {
  const btn = document.getElementById("favToggleBtn");
  const isFav = getFavourites().some(f => f.name === name);
  btn.textContent = isFav ? "♥ Saved" : "♡ Save";
  btn.classList.toggle("active", isFav);
}

function updateFavCount() {
  const favs = getFavourites();
  const badge = document.getElementById("favCount");
  if (favs.length > 0) {
    badge.textContent = favs.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function renderFavList() {
  const favs = getFavourites();
  const container = document.getElementById("favList");
  if (favs.length === 0) {
    container.innerHTML = '<div class="compare-empty">No saved medicines yet.</div>';
    return;
  }
  container.innerHTML = favs.map(f => `
    <div class="fav-item" onclick="quickSearch('${f.name}'); toggleFavPanel()">
      <div>
        <div class="fav-item-name">${f.name}</div>
        <div class="fav-item-generic">${f.genericName}</div>
      </div>
      <button class="fav-item-remove" onclick="removeFav('${f.name}', event)">✕</button>
    </div>
  `).join("");
}

function removeFav(name, event) {
  event.stopPropagation();
  let favs = getFavourites().filter(f => f.name !== name);
  saveFavourites(favs);
  if (currentMedicine?.name === name) updateFavBtn(name);
}

function toggleFavPanel() {
  const panel = document.getElementById("favPanel");
  const overlay = document.getElementById("panelOverlay");
  const isOpen = !panel.classList.contains("hidden");
  document.getElementById("comparePanel").classList.add("hidden");
  if (isOpen) {
    panel.classList.add("hidden");
    overlay.classList.add("hidden");
  } else {
    renderFavList();
    panel.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }
}

// =====================
// COMPARE
// =====================
function addToCompare() {
  if (!currentMedicine) return;
  if (compareList.find(m => m.name === currentMedicine.name)) {
    showToast("Already in compare list"); return;
  }
  if (compareList.length >= 3) {
    showToast("Max 3 medicines to compare"); return;
  }
  compareList.push({ ...currentMedicine });
  showToast("⊕ Added to compare");
  renderCompareSlots();
}

function removeFromCompare(name) {
  compareList = compareList.filter(m => m.name !== name);
  renderCompareSlots();
}

function renderCompareSlots() {
  const container = document.getElementById("compareSlots");
  const btn = document.getElementById("runCompareBtn");
  if (compareList.length === 0) {
    container.innerHTML = '<div class="compare-empty">Search for medicines and click <strong>Compare</strong> to add them here.</div>';
    btn.style.display = 'none';
    return;
  }
  container.innerHTML = compareList.map(m => `
    <div class="compare-slot">
      <span class="compare-slot-name">${m.name}</span>
      <button class="compare-slot-remove" onclick="removeFromCompare('${m.name}')">✕</button>
    </div>
  `).join("");
  btn.style.display = compareList.length >= 2 ? 'block' : 'none';
}

function toggleComparePanel() {
  const panel = document.getElementById("comparePanel");
  const overlay = document.getElementById("panelOverlay");
  const isOpen = !panel.classList.contains("hidden");
  document.getElementById("favPanel").classList.add("hidden");
  if (isOpen) {
    panel.classList.add("hidden");
    overlay.classList.add("hidden");
  } else {
    panel.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }
}

function closePanels() {
  document.getElementById("comparePanel").classList.add("hidden");
  document.getElementById("favPanel").classList.add("hidden");
  document.getElementById("panelOverlay").classList.add("hidden");
}

function runCompare() {
  if (compareList.length < 2) return;

  const fields = [
    { key: 'genericName', label: 'Generic Name' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'purpose', label: 'What It Treats' },
    { key: 'sideEffects', label: 'Side Effects' },
    { key: 'warnings', label: 'Warnings' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'whoShouldAvoid', label: 'Who Should Avoid' },
  ];

  const cols = compareList.length;
  let html = `<div class="compare-row" style="grid-template-columns: repeat(${cols}, 1fr)">` +
    compareList.map(m => `<div class="compare-cell"><div class="compare-cell-name">${m.name}</div></div>`).join("") +
    `</div>`;

  fields.forEach(field => {
    html += `<div class="compare-row" style="grid-template-columns: repeat(${cols}, 1fr)">
      <div class="compare-row-label" style="grid-column:1/-1">${field.label}</div>
      ${compareList.map(m => {
        const text = field.key === 'sideEffects' || field.key === 'warnings'
          ? simplifyJargon(m[field.key])
          : (m[field.key] || "Not available");
        return `<div class="compare-cell">${(text || "Not available").slice(0, 250)}${text?.length > 250 ? "..." : ""}</div>`;
      }).join("")}
    </div>`;
  });

  document.getElementById("compareTable").innerHTML = html;
  document.getElementById("compareModal").classList.remove("hidden");
  closePanels();
}

function closeCompareModal() {
  document.getElementById("compareModal").classList.add("hidden");
}

document.getElementById("compareModal").addEventListener("click", function (e) {
  if (e.target === this) closeCompareModal();
});

// =====================
// SHARE
// =====================
function shareResult() {
  if (!currentMedicine) return;
  const url = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(currentMedicine.name)}`;
  if (navigator.share) {
    navigator.share({ title: `MedScan — ${currentMedicine.name}`, url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast("Link copied!"));
  }
}

function checkURLQuery() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    document.getElementById("searchInput").value = q;
    handleSearch();
  }
}

// =====================
// TOAST
// =====================
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 2500);
}

// =====================
// INIT
// =====================
window.onload = function () {
  initTheme();
  renderRecent();
  updateFavCount();
  renderCompareSlots();
  checkURLQuery();
};