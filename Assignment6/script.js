// Global counter variable (shown in the page)
let counter = 0;

function updateCounter() {
  document.getElementById("counter").textContent = counter;
}

// -----------------------------
// 1pt: Simple Functions
// -----------------------------
function tickUp() {
  counter++;
  updateCounter();
}

function tickDown() {
  counter--;
  updateCounter();
}

// -----------------------------
// 1pt: Simple For Loop
// -----------------------------
function runForLoop() {
  let result = "";

  for (let i = 0; i <= counter; i++) {
    result += i + " ";
  }

  document.getElementById("forLoopResult").textContent = result.trim();
}

// -----------------------------
// 1pt: Repetition with Condition
// -----------------------------
function showOddNumbers() {
  let result = "";

  for (let i = 1; i <= counter; i++) {
    if (i % 2 !== 0) result += i + " ";
  }

  document.getElementById("oddNumberResult").textContent = result.trim();
}

// -----------------------------
// 1pt: Arrays
// -----------------------------
function addMultiplesToArray() {
  let arr = [];

  // reverse order: start at counter and go down
  for (let i = counter; i >= 5; i--) {
    if (i % 5 === 0) arr.push(i);
  }

  // print the array itself
  console.log(arr);
}

// -----------------------------
// 2pts: Objects and Form Fields
// -----------------------------
function printCarObject() {
  let car = {
    cType: document.getElementById("carType").value,
    cMPG: document.getElementById("carMPG").value,
    cColor: document.getElementById("carColor").value
  };

  console.log(car);
}

// -----------------------------
// 2pts: Objects and Form Fields pt. 2
// (loads carObject1/2/3 from footer)
// -----------------------------
function loadCar(num) {
  let car;

  if (num === 1) car = carObject1;
  else if (num === 2) car = carObject2;
  else car = carObject3;

  document.getElementById("carType").value = car.cType;
  document.getElementById("carMPG").value = car.cMPG;
  document.getElementById("carColor").value = car.cColor;
}

// -----------------------------
// 2pt: Changing Styles
// -----------------------------
function changeColor(num) {
  let p = document.getElementById("styleParagraph");

  if (num === 1) p.style.color = "red";
  else if (num === 2) p.style.color = "green";
  else p.style.color = "blue";
}
