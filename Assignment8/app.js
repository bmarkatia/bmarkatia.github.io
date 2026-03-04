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
input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') fetchPokemon();
});

function fetchPokemon() {
  var query = input.value.trim().toLowerCase();
  if (!query) return;

  errorMsg.style.display = 'none';
  findBtn.textContent = 'Loading...';
  findBtn.disabled = true;

  if (cache[query]) {
    displayPokemon(cache[query]);
    findBtn.textContent = 'Find';
    findBtn.disabled = false;
    return;
  }

  fetch('https://pokeapi.co/api/v2/pokemon/' + query)
    .then(function(res) {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(function(data) {
      cache[query] = data;
      displayPokemon(data);
      findBtn.textContent = 'Find';
      findBtn.disabled = false;
    })
    .catch(function() {
      errorMsg.textContent = 'Pokemon "' + query + '" not found. Check spelling and try again.';
      errorMsg.style.display = 'block';
      img.style.display = 'none';
      nameEl.style.display = 'none';
      audio.src = '';
      selects.forEach(function(s) { s.innerHTML = ''; });
      currentPokemon = null;
      findBtn.textContent = 'Find';
      findBtn.disabled = false;
    });
}

function displayPokemon(data) {
  currentPokemon = data;

  // Image
  var spriteUrl = (data.sprites &&
    data.sprites.other &&
    data.sprites.other['official-artwork'] &&
    data.sprites.other['official-artwork'].front_default)
    ? data.sprites.other['official-artwork'].front_default
    : (data.sprites && data.sprites.front_default ? data.sprites.front_default : '');

  img.src = spriteUrl;
  img.style.display = spriteUrl ? 'block' : 'none';

  // Name
  nameEl.textContent = data.name.toUpperCase();
  nameEl.style.display = 'block';

  // Cry / audio
  var cryUrl = '';
  if (data.cries) {
    cryUrl = data.cries.latest || data.cries.legacy || '';
  }
  audio.src = cryUrl;

  // Populate all 4 move dropdowns
  var moves = data.moves.map(function(m) { return m.move.name; });
  selects.forEach(function(s) {
    s.innerHTML = '';
    moves.forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      s.appendChild(opt);
    });
  });

  // Stagger default selected moves
  if (moves.length > 1) selects[1].selectedIndex = 1;
  if (moves.length > 2) selects[2].selectedIndex = 2;
  if (moves.length > 3) selects[3].selectedIndex = 3;
}

addBtn.addEventListener('click', function() {
  if (!currentPokemon) return;

  var selectedMoves = selects.map(function(s) { return s.value; }).filter(Boolean);
  if (selectedMoves.length === 0) return;

  var spriteUrl = currentPokemon.sprites && currentPokemon.sprites.front_default
    ? currentPokemon.sprites.front_default
    : '';

  var row = document.createElement('tr');

  var imgTd = document.createElement('td');
  if (spriteUrl) {
    var teamImg = document.createElement('img');
    teamImg.src = spriteUrl;
    teamImg.classList.add('team-img');
    imgTd.appendChild(teamImg);
  }

  var movesTd = document.createElement('td');
  var ul = document.createElement('ul');
  ul.classList.add('move-list');
  selectedMoves.forEach(function(m) {
    var li = document.createElement('li');
    li.textContent = m;
    ul.appendChild(li);
  });
  movesTd.appendChild(ul);

  row.appendChild(imgTd);
  row.appendChild(movesTd);
  teamBody.appendChild(row);

  teamTable.style.display = 'table';
});
