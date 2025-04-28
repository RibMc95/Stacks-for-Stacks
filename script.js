// Topping options
const toppingsList = [
  "chocolate chips",
  "blueberries",
  "bananas",
  "whipped cream",
  "maple syrup",
  "peanut butter",
];

// Daily Special Options
const flavorsList = [
  "chocolate",
  "blueberry",
  "banana",
  "cinnamon",
  "vanilla",
  "pumpkin spice",
];

function getDailySpecial() {
  const today = new Date();
  const index = (today.getMonth() + 1) * today.getDate(); // e.g. 4 * 19 = 76
  const flavor = flavorsList[index % flavorsList.length];
  const topping = toppingsList[index % toppingsList.length];
  return `${
    flavor.charAt(0).toUpperCase() + flavor.slice(1)
  } Pancakes with ${topping}`;
}

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

// fizzy level for drink
const fizzSlider = document.getElementById("fizzLevel");
const fizzDisplay = document.getElementById("fizzDisplay");

fizzSlider.addEventListener("input", () => {
  fizzDisplay.textContent = fizzSlider.value + "%";
});


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
  const remember = document.getElementById("rememberMe").checked;
  if (remember) {
    localStorage.setItem("rememberedName", customerName);
  } else {
    localStorage.removeItem("rememberedName");
  }

  const pancakeCount = parseInt(document.getElementById("pancakeCount").value);
  const flavors = Array.from(
    document.getElementsByClassName("pancakeFlavor")
  ).map((input) => escapeHTML(input.value));
  const toppings = Array.from(
    document.getElementsByClassName("pancakeTopping")
  ).map((select) => escapeHTML(select.value));

  const drinkFlavor = escapeHTML(document.getElementById("drinkFlavor").value);
  const fizzLevel = document.getElementById("fizzLevel").value;
  const drinkType = `${drinkFlavor} (Fizz: ${fizzLevel}%)`;
  const drinkAmount = parseInt(document.getElementById("drinkAmount").value);
  const maxDrinkOZ = 64;
  const minDrinkOZ = 8;
  const drink = [];

  if (drinkAmount < 8 || drinkAmount > 64) {
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

//  Theme toggle
const themeToggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  themeToggleBtn.textContent =
    theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
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
volumeSlider.value = Math.round(music.volume * 15);
volumeValue.textContent = volumeSlider.value + "%";

// Handle volume changes
volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value / 100;
  music.volume = volume;
  volumeValue.textContent = volumeSlider.value + "%";
  localStorage.setItem("musicVolume", volume);
});

// Prefill saved name
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("rememberedName");
  if (savedName) {
    document.getElementById("customerName").value = savedName;
    document.getElementById("rememberMe").checked = true;
  }

  // Show daily special
  const special = getDailySpecial();
  document.getElementById(
    "dailySpecial"
  ).textContent = `🥞 Today's Special: ${special}!`;
});

// 🧠 Chatbot Waiter
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

function addChatMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  msg.style.marginBottom = "6px";
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && chatInput.value.trim()) {
    const userText = chatInput.value.trim();
    addChatMessage("You", userText);
    chatInput.value = "";

    const botResponse = await getBotReply(userText.toLowerCase());
    setTimeout(() => addChatMessage("Waiter Bot", botResponse), 400);
  }
});

window.addEventListener("load", () => {
  setTimeout(() => {
    addChatMessage(
      "Waiter Bot",
      "Welcome to Stacks for Stacks! Ask me anything 🍽️"
    );
  }, 1000);
});

async function getBotReply(input) {
  if (input.includes("pancake recipe")) {
    return await getRecipeBySearch("pancake");
  }
  if (input.includes("dessert")) {
    return await getRecipeByCategory("Dessert");
  }
  if (input.includes("surprise") || input.includes("random")) {
    return await getRandomRecipe();
  }

  const casualReplies = {
    "hello": "Hi there! Need help with your stack?",
    "hi": "Hello! Pancakes or drinks today?",
    "menu": "We serve pancakes, toppings, drinks & daily specials!",
    "recommend": "Try the banana pancakes with peanut butter 🍌🥜",
    "hours": "We're open 24/7. Pancakes never sleep!",
    "thanks": "You're welcome! Happy stacking 🥞",
    "yes": "What do you need help with?",
    "flavor":"try something like cinnamon or blueberry for starters. Anything else?",
    "drinks":"You should try some type of juice or soft drink",
    "pluh": "https://www.youtube.com/watch?v=7TLbk7f3OOc",
    "waffles": "nah",
    "french toast": "nah",
  };

  for (const key in casualReplies) {
    if (input.includes(key)) return casualReplies[key];
  }

  return "I'm not sure, but try asking for a 'pancake recipe', 'dessert', or say 'surprise me'.";
}

async function getRecipeBySearch(term) {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
    );
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      const meal = data.meals[0];
      return `🍽️ ${meal.strMeal} — ${meal.strCategory}<br><a href="${
        meal.strSource || meal.strYoutube
      }" target="_blank">View Recipe</a>`;
    } else {
      return `Sorry, I couldn't find a recipe for "${term}".`;
    }
  } catch (err) {
    return "No way! We can't reach the recipe vault.";
  }
}

// fetches desert recipes
async function getRecipeByCategory(category) {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      const randomMeal =
        data.meals[Math.floor(Math.random() * data.meals.length)];
      return `🍰 How about: ${randomMeal.strMeal}?<br><a href="https://www.themealdb.com/meal/${randomMeal.idMeal}" target="_blank">View Recipe</a>`;
    } else {
      return "No recipes found right now!";
    }
  } catch (err) {
    return "No way! We can't reach the recipe vault";
  }
}

//fetches random recipes
async function getRandomRecipe() {
  try {
    const res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const data = await res.json();
    const meal = data.meals[0];
    return `🎲 Surprise dish: ${meal.strMeal} — ${
      meal.strCategory
    }<br><a href="${
      meal.strSource || meal.strYoutube
    }" target="_blank">Check it out</a>`;
  } catch (err) {
    return "No way! We can't reach the recipe vault";
  }
}

//  Minimize toggle
const chatbotBox = document.getElementById("chatbot");
const minimizeBtn = document.getElementById("minimizeChat");

minimizeBtn.addEventListener("click", () => {
  chatbotBox.classList.toggle("minimized");
  minimizeBtn.textContent = chatbotBox.classList.contains("minimized") ? "🔼" : "_";
});

//  Drag to move
let isDragging = false, offsetX = 0, offsetY = 0;

const header = document.getElementById("chatHeader");

header.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - chatbotBox.getBoundingClientRect().left;
  offsetY = e.clientY - chatbotBox.getBoundingClientRect().top;
});

// 🍴 Drag and Drop Ingredient Builder
const toppingsIcons = [
  { name: "chocolate chips", img: "images/chocolate-chip.png" },
  { name: "blueberries", img: "images/blueberry.png" },
  { name: "bananas", img: "images/banana.png" },
  { name: "whipped cream", img: "images/whip-cream.png" },
  { name: "maple syrup", img: "images/syrup.png" },
  { name: "peanut butter", img: "images/peanut.png" },
];

function buildIngredients() {
  const container = document.getElementById("ingredients");
  toppingsIcons.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.title = item.name;
    img.draggable = true;
    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.img);
    });
    container.appendChild(img);
  });
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const imgSrc = e.dataTransfer.getData("text/plain");
  const img = document.createElement("img");
  img.src = imgSrc;

  // Calculate position relative to the drop zone
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left - 20; // center image
  const y = e.clientY - rect.top - 20; // center image

  img.style.left = x + "px";
  img.style.top = y + "px";

  document.getElementById("addedIngredients").appendChild(img);
}

// Auto-build ingredient icons when page loads
window.addEventListener("DOMContentLoaded", buildIngredients);

