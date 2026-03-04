const API_BASE = "https://pokeapi.co/api/v2/pokemon/";
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

let currentPokemon = null; // { id, name, sprite, cry, moves[] }
let team = []; // array of saved mons

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
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
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
    // ignore cache errors (storage full / disabled)
  }
}

function resetViewer() {
  currentPokemon = null;
  spriteImg.style.display = "none";
  spriteImg.src = "";
  cryAudio.style.display = "none";
  cryAudio.src = "";
  moveSelects.forEach(s => {
    s.innerHTML = "";
    s.disabled = true;
  });
  addBtn.disabled = true;
}

function populateMoves(moves) {
  const options = ["-- choose a move --", ...moves];

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
  // Try cache first (minimize API calls)
  const cached = readCache(q);
  if (cached) return cached;

  const resp = await fetch(`${API_BASE}${encodeURIComponent(q)}/`);
  if (!resp.ok) {
    throw new Error(`Not found (HTTP ${resp.status})`);
  }
  const data = await resp.json();
  writeCache(q, data);
  return data;
}

function buildCurrentPokemonFromApi(data) {
  const id = data.id;
  const name = data.name;

  const sprite =
    data?.sprites?.front_default ||
    data?.sprites?.other?.["official-artwork"]?.front_default ||
    "";

  const cry =
    data?.cries?.latest ||
    data?.cries?.legacy ||
    "";

  const moves = (data.moves || [])
    .map(m => m?.move?.name)
    .filter(Boolean);

  return { id, name, sprite, cry, moves };
}

function renderViewer(p) {
  // Sprite
  if (p.sprite) {
    spriteImg.src = p.sprite;
    spriteImg.alt = `${p.name} sprite`;
    spriteImg.style.display = "block";
  } else {
    spriteImg.style.display = "none";
  }

  // Cry audio
  if (p.cry) {
    cryAudio.src = p.cry;
    cryAudio.load();
    cryAudio.style.display = "block";
  } else {
    cryAudio.style.display = "none";
  }

  // Moves dropdowns
  populateMoves(p.moves);

  addBtn.disabled = false;
}

function selectedMoves() {
  const picks = moveSelects
    .map(s => s.value)
    .filter(v => v && v.trim().length > 0);

  // If user picks duplicates, we’ll keep them as-is unless you want to enforce uniqueness.
  return picks;
}

function renderTeam() {
  teamBody.innerHTML = "";

  team.forEach((mon) => {
    const tr = document.createElement("tr");

    const tdMon = document.createElement("td");
    const wrap = document.createElement("div");
    wrap.className = "teamMon";

    const img = document.createElement("img");
    img.src = mon.sprite || "";
    img.alt = mon.name;

    const nameDiv = document.createElement("div");
    nameDiv.textContent = `${mon.name} (#${mon.id})`;

    wrap.appendChild(img);
    wrap.appendChild(nameDiv);
    tdMon.appendChild(wrap);

    const tdMoves = document.createElement("td");
    const ul = document.createElement("ul");
    mon.moves.forEach(mv => {
      const li = document.createElement("li");
      li.textContent = mv;
      ul.appendChild(li);
    });
    tdMoves.appendChild(ul);

    tr.appendChild(tdMon);
    tr.appendChild(tdMoves);
    teamBody.appendChild(tr);
  });
}

async function onFind() {
  const q = normalizeQuery(queryInput.value);
  if (!q) {
    setStatus("Enter a Pokemon name or ID.");
    return;
  }

  resetViewer();
  setStatus("Loading...");

  try {
    const apiData = await fetchPokemon(q);
    const p = buildCurrentPokemonFromApi(apiData);

    if (!p.moves.length) {
      setStatus("Loaded, but no moves found.");
    } else {
      setStatus(`Loaded: ${p.name} (#${p.id})`);
    }

    currentPokemon = p;
    renderViewer(p);
  } catch (err) {
    setStatus("Could not find that Pokemon. Try a number 1–151 or a valid name.");
    console.error(err);
  }
}

function onAdd() {
  if (!currentPokemon) return;

  const moves = selectedMoves();
  if (moves.length !== 4) {
    setStatus("Please choose 4 moves (one in each dropdown) before adding to team.");
    return;
  }

  // Optional: enforce max team size of 6 (classic Pokemon team)
  if (team.length >= 6) {
    setStatus("Team is full (max 6). Clear team to add more.");
    return;
  }

  team.push({
    id: currentPokemon.id,
    name: currentPokemon.name,
    sprite: currentPokemon.sprite,
    moves
  });

  renderTeam();
  setStatus(`Added ${currentPokemon.name} to team.`);
}

function onClear() {
  team = [];
  renderTeam();
  setStatus("Team cleared.");
}

findBtn.addEventListener("click", onFind);
addBtn.addEventListener("click", onAdd);
clearBtn.addEventListener("click", onClear);

// Nice UX: press Enter to search
queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onFind();
});

// init
resetViewer();
renderTeam();
