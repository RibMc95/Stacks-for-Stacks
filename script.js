document.getElementById("pancakeCount").addEventListener("change", () => {
  const count = parseInt(document.getElementById("pancakeCount").value);
  const flavorInputs = document.getElementById("flavorInputs");
  flavorInputs.innerHTML = "";

  for (let i = 0; i < count; i++) {
    flavorInputs.innerHTML += `<label>Flavor for pancake #${i + 1}:</label>
    <input type="text" class="pancakeFlavor" required><br>`;
  }
});

document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const pancakeCount = parseInt(document.getElementById("pancakeCount").value);
  const drinkType = document.getElementById("drinkType").value;
  const drinkAmount = parseInt(document.getElementById("drinkAmount").value);
  const flavors = Array.from(document.getElementsByClassName("pancakeFlavor")).map(input => input.value);

  const drink = [];
  for (let i = 0; i < drinkAmount; i++) {
    drink.push(1); // 1 oz per pour
  }

  let output = `<h2> Order Summary:</h2>`;
  output += `<p>- ${drink.length} oz of ${drinkType}</p>`;
  output += `<p>- ${flavors.length} pancake(s):</p><ul>`;
  for (let i = flavors.length - 1; i >= 0; i--) {
    output += `<li>${flavors[i]} pancake</li>`;
  }
  output += "</ul>";

  document.getElementById("output").innerHTML = output;
});
