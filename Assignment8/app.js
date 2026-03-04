// Pokemon Team Builder (vanilla JS)
// Uses PokeAPI: https://pokeapi.co/api/v2/pokemon/{id or name}

const API_BASE = "https://pokeapi.co/api/v2/pokemon/";

// Cache settings (localStorage) to reduce calls
const CACHE_PREFIX = "poke_cache_v1:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const el = (id) => document.getElementById(id);

const queryInput = el("query");
const findBtn = el("findBtn");
const addBtn = el("addBtn");
const clearBtn = el("clearBtn");
const statusEl = el("status");

const spriteImg = el("sprite");
const cryAudio = el("cry");

const moveSelects = [el("move1"), el("move2"), el("move3"), el("move4")];
const teamBody = el("teamBody");

let currentPokemon = null; // { id, name, spriteUrl, cryUrl, moveNames[] }
let team = []; // saved entries

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function normalizeQuery(q) {
  return (q || "").trim().toLowerCase();
}

function cacheKey(q) {
  return `${CACHE_PREFIX}${q}`;
}

function readCache(q) {
  try {
    const raw = localStorage.getItem(cacheKey(q));
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (!parsed.savedAt || !parsed.data) return null;

    const age = Date.now() - parsed.savedAt;
    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(q));
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(q, data) {
  try {
    localStorage.setItem(cacheKey(q), JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // ignore storage errors
  }
}

function resetUIForNewSearch() {
  currentPokemon = null;

  spriteImg.style.display = "none";
  spriteImg.src = "";

  cryAudio.style.display = "none";
  cryAudio.src = "";

  moveSelects.forEach((s) => {
    s.innerHTML = "";
    s.disabled = true;
  });

  addBtn.disabled = true;
}

function fillMoveDropdowns(moveNames) {
  const options = ["-- choose a move --", ...moveNames];

  moveSelects.forEach((select) => {
    select.disabled = false;
    select.innerHTML = "";

    options.forEach((name, idx) => {
      const opt = document.createElement("option");
      opt.value = idx === 0 ? "" : name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  });
}

async function fetchPokemon(q) {
  const cached = readCache(q);
  if (cached) return cached;

  const url = `${API_BASE}${encodeURIComponent(q)}/`;
  const resp = await fetch(url);

  if (!resp.ok) {
    throw new Error(`Pokemon not found: ${q} (HTTP ${resp.status})`);
  }

  const data = await resp.json();
  writeCache(q, data);
  return data;
}

function buildPokemonFromApi(data) {
  const id = data.id;
  const name = data.name;

  const spriteUrl =
    data?.sprites?.front_default ||
    data?.sprites?.other?.["official-artwork"]?.front_default ||
    "";

  const cryUrl =
    data?.cries?.latest ||
    data?.cries?.legacy ||
    "";

  const moveNames = (data.moves || [])
    .map((m) => m?.move?.name)
    .filter(Boolean);

  return { id, name, spriteUrl, cryUrl, moveNames };
}

function showPokemon(p) {
  // Image
  if (p.spriteUrl) {
    spriteImg.src = p.spriteUrl;
    spriteImg.alt = `${p.name} sprite`;
    spriteImg.style.display = "block";
  } else {
    spriteImg.style.display = "none";
  }

  // Audio
  if (p.cryUrl) {
    cryAudio.src = p.cryUrl;
    cryAudio.load();
    cryAudio.style.display = "block";
  } else {
    cryAudio.style.display = "none";
  }

  // Moves
  fillMoveDropdowns(p.moveNames);

  addBtn.disabled = false;
}

function getChosenMoves() {
  return moveSelects.map((s) => s.value.trim());
}

function renderTeam() {
  teamBody.innerHTML = "";

  // One row per Pokemon, like your sample
  team.forEach((entry, idx) => {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    const wrap = document.createElement("div");
    wrap.className = "teamRow";

    const img = document.createElement("img");
    img.src = entry.spriteUrl || "";
    img.alt = entry.name;

    const ul = document.createElement("ul");
    ul.className = "movesList";

    entry.moves.forEach((mv) => {
      const li = document.createElement("li");
      li.textContent = mv;
      ul.appendChild(li);
    });

    wrap.appendChild(img);
    wrap.appendChild(ul);

    td.appendChild(wrap);
    tr.appendChild(td);

    teamBody.appendChild(tr);
  });
}

async function onFindClick() {
  const q = normalizeQuery(queryInput.value);

  if (!q) {
    setStatus("Enter a Pokemon name or ID.");
    return;
  }

  resetUIForNewSearch();
  setStatus("Loading...");

  try {
    const apiData = await fetchPokemon(q);
    const p = buildPokemonFromApi(apiData);

    if (!p.moveNames.length) {
      setStatus(`Loaded ${p.name} (#${p.id}), but no moves found.`);
    } else {
      setStatus(`Loaded ${p.name} (#${p.id}). Choose 4 moves.`);
    }

    currentPokemon = p;
    showPokemon(p);
  } catch (err) {
    console.error(err);
    setStatus("Could not find that Pokemon. Try a valid name or an ID number.");
  }
}

function onAddToTeam() {
  if (!currentPokemon) return;

  const chosen = getChosenMoves();

  // Require a selection in each dropdown
  if (chosen.some((mv) => mv.length === 0)) {
    setStatus("Pick a move in all 4 dropdowns before adding to team.");
    return;
  }

  // Optional: classic team size limit (you can remove if not wanted)
  if (team.length >= 6) {
    setStatus("Team is full (max 6). Clear team to add more.");
    return;
  }

  team.push({
    id: currentPokemon.id,
    name: currentPokemon.name,
    spriteUrl: currentPokemon.spriteUrl,
    moves: chosen
  });

  renderTeam();
  setStatus(`Added ${currentPokemon.name} to team.`);
}

function onClearTeam() {
  team = [];
  renderTeam();
  setStatus("Team cleared.");
}

findBtn.addEventListener("click", onFindClick);
addBtn.addEventListener("click", onAddToTeam);
clearBtn.addEventListener("click", onClearTeam);

// Press Enter in the input to search
queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onFindClick();
});

// init
resetUIForNewSearch();
renderTeam();
setStatus("Ready.");
