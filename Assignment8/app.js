var cache = {};
var currentPokemon = null;

var input = document.getElementById('pokemon-input');
var findBtn = document.getElementById('find-btn');
var img = document.getElementById('pokemon-img');
var nameEl = document.getElementById('pokemon-name');
var audio = document.getElementById('pokemon-audio');
var move1 = document.getElementById('move1');
var move2 = document.getElementById('move2');
var move3 = document.getElementById('move3');
var move4 = document.getElementById('move4');
var selects = [move1, move2, move3, move4];
var addBtn = document.getElementById('add-btn');
var errorMsg = document.getElementById('error-msg');
var teamTable = document.getElementById('team-table');
var teamBody = document.getElementById('team-body');

findBtn.addEventListener('click', fetchPokemon);

input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    fetchPokemon();
  }
});

function fetchPokemon() {
  var query = input.value.trim().toLowerCase();
  if (!query) return;

  errorMsg.style.display = 'none';
  errorMsg.textContent = '';
  findBtn.textContent = 'Loading...';
  findBtn.disabled = true;

  if (cache[query]) {
    displayPokemon(cache[query]);
    findBtn.textContent = 'Find';
    findBtn.disabled = false;
    return;
  }

  var url = 'https://pokeapi.co/api/v2/pokemon/' + query;

  fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Pokemon not found: ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      cache[query] = data;
      displayPokemon(data);
      findBtn.textContent = 'Find';
      findBtn.disabled = false;
    })
    .catch(function(err) {
      errorMsg.textContent = 'Could not find "' + query + '". Check the spelling and try again.';
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

  /* --- Image --- */
  var spriteUrl = '';
  if (data.sprites && data.sprites.other && data.sprites.other['official-artwork']) {
    spriteUrl = data.sprites.other['official-artwork'].front_default || '';
  }
  if (!spriteUrl && data.sprites) {
    spriteUrl = data.sprites.front_default || '';
  }
  if (spriteUrl) {
    img.src = spriteUrl;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  /* --- Name --- */
  nameEl.textContent = data.name.toUpperCase();
  nameEl.style.display = 'block';

  /* --- Audio cry --- */
  var cryUrl = '';
  if (data.cries) {
    cryUrl = data.cries.latest || data.cries.legacy || '';
  }
  audio.src = cryUrl;

  /* --- Moves: populate all 4 dropdowns --- */
  var moves = [];
  for (var i = 0; i < data.moves.length; i++) {
    moves.push(data.moves[i].move.name);
  }

  selects.forEach(function(s) {
    s.innerHTML = '';
    for (var i = 0; i < moves.length; i++) {
      var opt = document.createElement('option');
      opt.value = moves[i];
      opt.textContent = moves[i];
      s.appendChild(opt);
    }
  });

  /* Set each dropdown to a different default move */
  if (moves.length > 1) selects[1].selectedIndex = 1;
  if (moves.length > 2) selects[2].selectedIndex = 2;
  if (moves.length > 3) selects[3].selectedIndex = 3;
}

addBtn.addEventListener('click', function() {
  if (!currentPokemon) return;

  var selectedMoves = [];
  selects.forEach(function(s) {
    if (s.value) selectedMoves.push(s.value);
  });
  if (selectedMoves.length === 0) return;

  /* Use small front_default sprite for the team table */
  var spriteUrl = '';
  if (currentPokemon.sprites && currentPokemon.sprites.front_default) {
    spriteUrl = currentPokemon.sprites.front_default;
  }

  var row = document.createElement('tr');

  /* Image cell */
  var imgTd = document.createElement('td');
  if (spriteUrl) {
    var teamImg = document.createElement('img');
    teamImg.src = spriteUrl;
    teamImg.className = 'team-img';
    imgTd.appendChild(teamImg);
  }

  /* Moves cell */
  var movesTd = document.createElement('td');
  var ul = document.createElement('ul');
  ul.className = 'move-list';
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
