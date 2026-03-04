const cache = {};
let currentPokemon = null;

const input = document.getElementById('pokemon-input');
const findBtn = document.getElementById('find-btn');
const img = document.getElementById('pokemon-img');
const nameEl = document.getElementById('pokemon-name');
const audio = document.getElementById('pokemon-audio');
const selects = [
  document.getElementById('move1'),
  document.getElementById('move2'),
  document.getElementById('move3'),
  document.getElementById('move4'),
];
const addBtn = document.getElementById('add-btn');
const errorMsg = document.getElementById('error-msg');
const teamTable = document.getElementById('team-table');
const teamBody = document.getElementById('team-body');

findBtn.addEventListener('click', fetchPokemon);
input.addEventListener('keydown', e => { if (e.key === 'Enter') fetchPokemon(); });

async function fetchPokemon() {
  const query = input.value.trim().toLowerCase();
  if (!query) return;

  errorMsg.style.display = 'none';
  findBtn.textContent = 'Loading...';
  findBtn.disabled = true;

  let data;
  if (cache[query]) {
    data = cache[query];
  } else {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
      cache[query] = data;
    } catch (err) {
      errorMsg.textContent = `Pokémon "${query}" not found. Check the spelling and try again.`;
      errorMsg.style.display = 'block';
      img.style.display = 'none';
      nameEl.style.display = 'none';
      audio.src = '';
      selects.forEach(s => { s.innerHTML = ''; });
      currentPokemon = null;
      findBtn.textContent = 'Find';
      findBtn.disabled = false;
      return;
    }
  }

  findBtn.textContent = 'Find';
  findBtn.disabled = false;

  currentPokemon = data;

  // Image
  const spriteUrl = data.sprites?.other?.['official-artwork']?.front_default
    || data.sprites?.front_default;
  img.src = spriteUrl || '';
  img.style.display = spriteUrl ? 'block' : 'none';

  // Name
  nameEl.textContent = data.name.toUpperCase();
  nameEl.style.display = 'block';

  // Cry
  const cryUrl = data.cries?.latest || data.cries?.legacy || '';
  audio.src = cryUrl;

  // Moves - populate all 4 selects with all moves
  const moves = data.moves.map(m => m.move.name);
  selects.forEach(s => {
    s.innerHTML = '';
    moves.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      s.appendChild(opt);
    });
  });

  // Set different default starting moves
  if (moves.length > 1) selects[1].selectedIndex = Math.min(1, moves.length - 1);
  if (moves.length > 2) selects[2].selectedIndex = Math.min(2, moves.length - 1);
  if (moves.length > 3) selects[3].selectedIndex = Math.min(3, moves.length - 1);
}

addBtn.addEventListener('click', () => {
  if (!currentPokemon) return;

  const selectedMoves = selects.map(s => s.value).filter(Boolean);
  if (selectedMoves.length === 0) return;

  const spriteUrl = currentPokemon.sprites?.front_default || '';

  const row = document.createElement('tr');

  const imgTd = document.createElement('td');
  if (spriteUrl) {
    const teamImg = document.createElement('img');
    teamImg.src = spriteUrl;
    teamImg.classList.add('team-img');
    imgTd.appendChild(teamImg);
  }

  const movesTd = document.createElement('td');
  const ul = document.createElement('ul');
  ul.classList.add('move-list');
  selectedMoves.forEach(m => {
    const li = document.createElement('li');
    li.textContent = m;
    ul.appendChild(li);
  });
  movesTd.appendChild(ul);

  row.appendChild(imgTd);
  row.appendChild(movesTd);
  teamBody.appendChild(row);

  teamTable.style.display = 'table';
});
