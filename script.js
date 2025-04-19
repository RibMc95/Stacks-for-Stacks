// Topping options
const toppingsList = [
  "chocolate chips",
  "blueberries",
  "bananas",
  "whipped cream",
  "maple syrup",
  "peanut butter",
];

// Escape HTML for safe rendering
function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag])
  );
}

// Generate pancake flavor input fields and topping selectors
document.getElementById("pancakeCount").addEventListener("change", () => {
  const count = parseInt(document.getElementById("pancakeCount").value);
  const flavorInputs = document.getElementById("flavorInputs");
  flavorInputs.innerHTML = "";

  const toppingOptions = toppingsList
    .map((topping) => `<option value="${topping}">${topping}</option>`)
    .join("");

  for (let i = 0; i < count; i++) {
    flavorInputs.innerHTML += `
      <label>Flavor for pancake #${i + 1}:</label>
      <input type="text" class="pancakeFlavor" required><br>
      <label>Topping for pancake #${i + 1}:</label>
      <select class="pancakeTopping">${toppingOptions}</select><br><br>
    `;
  }
});

document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const pancakeCount = parseInt(document.getElementById("pancakeCount").value);
  const flavors = Array.from(
    document.getElementsByClassName("pancakeFlavor")
  ).map((input) => escapeHTML(input.value));
  const toppings = Array.from(
    document.getElementsByClassName("pancakeTopping")
  ).map((select) => escapeHTML(select.value));

  const drinkType = escapeHTML(document.getElementById("drinkType").value);
  const drinkAmount = parseInt(document.getElementById("drinkAmount").value);
  const maxDrinkOZ = 64;
  const minDrinkOZ = 8;
  const drink = [];

  if (drinkAmount < minDrinkOZ || drinkAmount > maxDrinkOZ) {
    alert(
      `Whoa there! You can't order less than ${minDrinkOZ} or more than ${maxDrinkOZ} ounces of ${drinkType}`
    );
    return;
  }

  for (let i = 0; i < drinkAmount; i++) {
    drink.push(1);
  }

  // Update progress bar
  const progressBar = document.getElementById("drinkProgress");
  progressBar.max = maxDrinkOZ;
  progressBar.value = Math.min(drink.length, maxDrinkOZ);

  // Build summary
  let output = `<h2>Order Summary:</h2>`;
  output += `<p>- ${drink.length} oz of ${drinkType}</p>`;
  output += `<p>- ${flavors.length} pancake(s):</p><ul>`;
  for (let i = flavors.length - 1; i >= 0; i--) {
    output += `<li>${flavors[i]} pancake with ${toppings[i]}</li>`;
  }
  output += "</ul>";

  // Save order to localStorage
  const order = {
    pancakes: flavors,
    toppings: toppings,
    drink: drinkType,
    amount: drink.length,
    timestamp: new Date().toLocaleString(),
  };

  let history = JSON.parse(localStorage.getItem("orders")) || [];
  history.push(order);
  localStorage.setItem("orders", JSON.stringify(history));

  // Play sound effect
  document.getElementById("output").innerHTML = output;
  document.getElementById("orderSound").play();
});

function showOrderHistory() {
  const history = JSON.parse(localStorage.getItem("orders")) || [];
  if (history.length === 0) {
    document.getElementById("output").innerHTML =
      "<p>No previous orders found.</p>";
    return;
  }

  let html = "<h2>🕓 Previous Orders</h2>";
  history.forEach((order, i) => {
    const toppingText = order.toppings
      ? ` with toppings: ${order.toppings.join(", ")}`
      : "";
    html += `<p><strong>Order #${i + 1}</strong> (${order.timestamp})<br>
    Drink: ${order.amount} oz of ${order.drink}<br>
    Pancakes: ${order.pancakes.join(", ")}${toppingText}</p>`;
  });

  document.getElementById("output").innerHTML = html;
}

// Optional: Reset site
function resetOrders() {
  if (confirm("Are you sure you want to clear all orders?")) {
    localStorage.clear();
    location.reload();
  }
}

