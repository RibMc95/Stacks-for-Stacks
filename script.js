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

  const customerName = escapeHTML(
    document.getElementById("customerName").value.trim()
  );
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
  output += `<p><strong>Name:</strong> ${customerName}</p>`;
  output += `<p>- ${drink.length} oz of ${drinkType}</p>`;
  output += `<p>- ${flavors.length} pancake(s):</p><ul>`;
  for (let i = flavors.length - 1; i >= 0; i--) {
    const imageName = toppings[i].toLowerCase().replace(/ /g, "-");
    output += `<li>${flavors[i]} pancake with ${toppings[i]} <img src="images/${imageName}.png" alt="${toppings[i]}" width="40" style="vertical-align:middle;"></li>`;
  }
  output += "</ul>";

  // Save order to localStorage
  const order = {
    name: customerName,
    pancakes: flavors,
    toppings: toppings,
    drink: drinkType,
    amount: drink.length,
    timestamp: new Date().toLocaleString(),
  };

  let history = JSON.parse(localStorage.getItem("orders")) || [];
  history.push(order);
  localStorage.setItem("orders", JSON.stringify(history));

  // Show output + play sound
  document.getElementById("output").innerHTML = output;
  document.getElementById("orderSound").play();
});

// Show previous orders
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
    html += `<p><strong>Order #${i + 1}</strong> by ${order.name} (${
      order.timestamp
    })<br>
    Drink: ${order.amount} oz of ${order.drink}<br>
    Pancakes: ${order.pancakes.join(", ")}${toppingText}</p>`;
  });

  document.getElementById("output").innerHTML = html;
}

// Show statistics
function showStatistics() {
  const history = JSON.parse(localStorage.getItem("orders")) || [];

  if (history.length === 0) {
    document.getElementById("output").innerHTML =
      "<p>No stats available yet.</p>";
    return;
  }

  const pancakeCounts = {};
  const toppingCounts = {};
  const drinkCounts = {};
  let totalOunces = 0;

  history.forEach((order) => {
    totalOunces += order.amount;

    order.pancakes.forEach((flavor) => {
      const normal = flavor.toLowerCase();
      pancakeCounts[normal] = (pancakeCounts[normal] || 0) + 1;
    });

    if (order.toppings) {
      order.toppings.forEach((topping) => {
        toppingCounts[topping] = (toppingCounts[topping] || 0) + 1;
      });
    }

    drinkCounts[order.drink] = (drinkCounts[order.drink] || 0) + 1;
  });

  function getMostCommon(obj) {
    return Object.entries(obj).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["None", 0]
    )[0];
  }

  const mostPopularFlavor = getMostCommon(pancakeCounts);
  const mostPopularTopping = getMostCommon(toppingCounts);
  const mostPopularDrink = getMostCommon(drinkCounts);

  let html = `<h2>📊 Order Statistics</h2>
    <p><strong>Most Popular Pancake Flavor:</strong> ${mostPopularFlavor}</p>
    <p><strong>Most Popular Topping:</strong> ${mostPopularTopping}</p>
    <p><strong>Most Ordered Drink:</strong> ${mostPopularDrink}</p>
    <p><strong>Total Ounces Poured:</strong> ${totalOunces} oz</p>`;

  document.getElementById("output").innerHTML = html;
}

// Show orders by name
function showOrdersByName() {
  const name = prompt("Enter your name to view your orders:").trim();
  const history = JSON.parse(localStorage.getItem("orders")) || [];

  const filtered = history.filter(
    (order) => order.name.toLowerCase() === name.toLowerCase()
  );

  if (filtered.length === 0) {
    document.getElementById(
      "output"
    ).innerHTML = `<p>No orders found for "${name}".</p>`;
    return;
  }

  let html = `<h2>🧾 Orders by ${escapeHTML(name)}</h2>`;
  filtered.forEach((order, i) => {
    html += `<p><strong>Order #${i + 1}</strong> (${order.timestamp})<br>
    Drink: ${order.amount} oz of ${order.drink}<br>
    Pancakes: ${order.pancakes.join(", ")} with ${order.toppings.join(
      ", "
    )}</p>`;
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

// 🌗 Theme toggle
const themeToggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
}

// Load theme from storage on startup
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Toggle theme on button click
themeToggleBtn.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(newTheme);
});

// 🎶 Theme music toggle
const music = document.getElementById("themeMusic");
const musicToggleBtn = document.getElementById("musicToggle");

// Try to auto-play after interaction
let musicStarted = false;
function tryStartMusic() {
  if (!musicStarted) {
    music.play().catch(() => {});
    musicStarted = true;
  }
}
document.body.addEventListener("click", tryStartMusic, { once: true });

// Handle toggle button
musicToggleBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    musicToggleBtn.textContent = "🔊 Music On";
  } else {
    music.pause();
    musicToggleBtn.textContent = "🔇 Music Off";
  }
});

//  Volume slider logic
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");

// Load saved volume or default to 1 (100%)
const savedVolume = localStorage.getItem("musicVolume");
music.volume = savedVolume !== null ? parseFloat(savedVolume) : 1;
volumeSlider.value = Math.round(music.volume * 100);
volumeValue.textContent = volumeSlider.value + "%";

// Handle volume changes
volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value / 100;
  music.volume = volume;
  volumeValue.textContent = volumeSlider.value + "%";
  localStorage.setItem("musicVolume", volume);
});

