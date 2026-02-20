function showFilter() {
  const filterForm = document.getElementById("filterContent");
  const addForm = document.getElementById("newContent");

  // toggle filter form
  filterForm.style.display = (filterForm.style.display === "none" || filterForm.style.display === "")
    ? "block"
    : "none";

  // optional: hide add form when filter opens
  addForm.style.display = "none";
}

function showAddNew() {
  const addForm = document.getElementById("newContent");
  const filterForm = document.getElementById("filterContent");

  // toggle add form
  addForm.style.display = (addForm.style.display === "none" || addForm.style.display === "")
    ? "flex"
    : "none";

  // optional: hide filter form when add opens
  filterForm.style.display = "none";
}

function filterArticles() {
  const showOpinion = document.getElementById("opinionCheckbox").checked;
  const showRecipe  = document.getElementById("recipeCheckbox").checked;
  const showUpdate  = document.getElementById("updateCheckbox").checked;

  document.querySelectorAll("#articleList article.opinion").forEach(a => {
    a.style.display = showOpinion ? "" : "none";
  });

  document.querySelectorAll("#articleList article.recipe").forEach(a => {
    a.style.display = showRecipe ? "" : "none";
  });

  document.querySelectorAll("#articleList article.update").forEach(a => {
    a.style.display = showUpdate ? "" : "none";
  });
}

function addNewArticle() {
  const title = document.getElementById("inputHeader").value.trim();
  const text  = document.getElementById("inputArticle").value.trim();

  const opinionChecked = document.getElementById("opinionRadio").checked;
  const recipeChecked  = document.getElementById("recipeRadio").checked;
  const updateChecked  = document.getElementById("lifeRadio").checked;

  let typeClass = "";
  let typeLabel = "";

  if (opinionChecked) { typeClass = "opinion"; typeLabel = "Opinion"; }
  else if (recipeChecked) { typeClass = "recipe"; typeLabel = "Recipe"; }
  else if (updateChecked) { typeClass = "update"; typeLabel = "Update"; }

  if (!title || !text || !typeClass) {
    alert("Please enter a title, text, and select a type.");
    return;
  }

  const articleList = document.getElementById("articleList");

  // make a new article card that matches your existing HTML structure :contentReference[oaicite:9]{index=9}
  const newArticle = document.createElement("article");
  newArticle.className = typeClass;

  newArticle.innerHTML = `
    <span class="marker">${typeLabel}</span>
    <h2>${title}</h2>
    <p>${text}</p>
    <p><a href="moreDetails.html">Read more...</a></p>
  `;

  articleList.appendChild(newArticle);

  // clear inputs
  document.getElementById("inputHeader").value = "";
  document.getElementById("inputArticle").value = "";
  document.getElementById("opinionRadio").checked = false;
  document.getElementById("recipeRadio").checked = false;
  document.getElementById("lifeRadio").checked = false;

  // apply filters so new one hides/shows correctly
  filterArticles();
}
