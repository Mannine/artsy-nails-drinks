// ======================= CONFIG =======================
// Change this to the salon's email address to receive drink orders.
// The first order sent to a new address triggers a one-time activation
// email from formsubmit.co — click "Activate" in it and orders flow.
const NOTIFY_EMAIL = "mattmbusiness@gmail.com";

// After a successful order, return to the start screen automatically
// (handy if the page is ever left open on a salon tablet).
const RESET_AFTER_SECONDS = 90;
// ======================================================

const STAFF = [
  { name: "Natalia", title: "Top Master Educator", photo: "img/natalia.jpg" },
  { name: "Amalia",  title: "Advance Tech",        photo: "img/amalia.jpg" },
  { name: "Anna",    title: "Junior Tech",         photo: "img/anna.jpg" },
  { name: "Iasmym",  title: "Advance Tech",        photo: "img/iasmym.jpg" },
];

const DRINKS = {
  "Cold": [
    { name: "Iced Coffee",          emoji: "🧋", sugar: true },
    { name: "Iced Caramel Latte",   emoji: "🍯" },
    { name: "Iced Latte",           emoji: "🥛" },
    { name: "Coke Zero",            emoji: "🥤" },
    { name: "Red Wine",             emoji: "🍷" },
    { name: "White Wine (chilled)", emoji: "🍇" },
    { name: "Water",                emoji: "💧" },
    { name: "Sparkling Water",      emoji: "🫧" },
    { name: "Champagne",            emoji: "🥂" },
  ],
  "Hot": [
    { name: "Chai Latte",    emoji: "🍵" },
    { name: "Black Coffee",  emoji: "☕", sugar: true },
    { name: "Hot Latte",     emoji: "🥛", sugar: true },
    { name: "Caramel Latte", emoji: "🍮" },
  ],
};

// sugar is null for drinks without the option, otherwise 0-4 teaspoons
const order = { tech: null, drink: null, temp: null, emoji: null, sugar: null };
let resetTimer = null;

function show(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Step 1: staff ----------
const staffGrid = document.getElementById("staff-grid");
STAFF.forEach(person => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "staff-card";
  card.innerHTML = `
    <img class="staff-photo" src="${person.photo}" alt="${person.name}">
    <div class="staff-name">${person.name}</div>
    <div class="staff-title">${person.title}</div>`;
  card.addEventListener("click", () => {
    order.tech = person.name;
    document.getElementById("drinks-heading").innerHTML =
      `Lovely! Now pick<br>your free drink`;
    show("screen-drinks");
  });
  staffGrid.appendChild(card);
});

// ---------- Sugar picker (drinks flagged with sugar: true) ----------
const sugarBlock = document.getElementById("sugar-block");
const sugarOptions = document.getElementById("sugar-options");
[0, 1, 2, 3, 4].forEach(n => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sugar-btn";
  btn.textContent = n === 0 ? "None" : n;
  btn.addEventListener("click", () => selectSugar(n));
  sugarOptions.appendChild(btn);
});

function selectSugar(n) {
  order.sugar = n;
  [...sugarOptions.children].forEach((b, i) => b.classList.toggle("selected", i === n));
}

// ---------- Step 2: drinks ----------
function buildDrinkList(containerId, temp) {
  const container = document.getElementById(containerId);
  DRINKS[temp].forEach(drink => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "drink-btn";
    btn.innerHTML = `<span class="drink-emoji">${drink.emoji}</span><span>${drink.name}</span>`;
    btn.addEventListener("click", () => {
      order.drink = drink.name;
      order.temp = temp;
      order.emoji = drink.emoji;
      document.getElementById("summary-emoji").textContent = drink.emoji;
      document.getElementById("summary-drink").textContent = drink.name;
      document.getElementById("summary-tech").textContent =
        `while ${order.tech} does your nails`;
      if (drink.sugar) {
        sugarBlock.hidden = false;
        selectSugar(0);
      } else {
        sugarBlock.hidden = true;
        order.sugar = null;
      }
      document.getElementById("send-error").hidden = true;
      show("screen-confirm");
    });
    container.appendChild(btn);
  });
}
buildDrinkList("cold-drinks", "Cold");
buildDrinkList("hot-drinks", "Hot");

// ---------- Back buttons ----------
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => show(btn.dataset.back));
});

// ---------- Step 3: submit ----------
const submitBtn = document.getElementById("submit-order");
submitBtn.addEventListener("click", async () => {
  const errorBox = document.getElementById("send-error");
  errorBox.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  const payload = {
    _subject: `🍹 Drink order: ${order.drink} — ${order.tech}'s client`,
    _template: "table",
    _captcha: "false",
    "Drink": `${order.emoji} ${order.drink}`,
    "Hot / Cold": order.temp,
    "Nail Tech": order.tech,
    "Ordered At": new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
  };
  if (order.sugar !== null) {
    payload["Sugar"] = order.sugar === 0 ? "No sugar" : `${order.sugar} tsp`;
  }

  let ok = false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    ok = res.ok && String(data.success) !== "false";
  } catch (e) {
    ok = false;
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Order My Drink";

  if (ok) {
    document.getElementById("done-emoji").textContent = order.emoji;
    document.getElementById("done-title").textContent = "Cheers!";
    const sugarNote = order.sugar ? ` with ${order.sugar} tsp of sugar` : "";
    document.getElementById("done-text").textContent =
      `Your ${order.drink.toLowerCase()}${sugarNote} is on its way. Sit back, relax, and enjoy your appointment.`;
    show("screen-done");
    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetApp, RESET_AFTER_SECONDS * 1000);
  } else {
    errorBox.textContent =
      `We couldn't send your order automatically — no worries! Just let ${order.tech} know you'd like a ${order.drink}.`;
    errorBox.hidden = false;
  }
});

// ---------- Done / reset ----------
document.getElementById("order-again").addEventListener("click", resetApp);

function resetApp() {
  clearTimeout(resetTimer);
  order.tech = order.drink = order.temp = order.emoji = order.sugar = null;
  document.getElementById("send-error").hidden = true;
  show("screen-staff");
}
