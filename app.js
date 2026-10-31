// Public connection settings only. Notification credentials belong on the worker.
const ORDER_ENDPOINT = window.ARTSY_ORDER_CONFIG?.endpoint || "";
const TURNSTILE_SITE_KEY = window.ARTSY_ORDER_CONFIG?.turnstileSiteKey || "";
const RESET_AFTER_SECONDS = 90;

const STAFF = [
  { name: "Natalia", title: "Top Master Educator", photo: "img/natalia.jpg" },
  { name: "Anna",    title: "Junior Tech",         photo: "img/anna.jpg" },
  { name: "Iasmym",  title: "Advance Tech",        photo: "img/iasmym.jpg" },
  { name: "Christina", title: "Junior Tech", photo: "img/christina-summer.jpg" },
];

const DRINKS = {
  "Cold": [
    { name: "Iced Coffee", sugar: true },
    { name: "Iced Caramel Latte" },
    { name: "Iced Latte" },
    { name: "Strawberry Matcha" },
    { name: "Coke Zero" },
    { name: "Red Wine" },
    { name: "White Wine (chilled)" },
    { name: "Water" },
    { name: "Sparkling Water" },
    { name: "Champagne" },
  ],
  "Hot": [
    { name: "Chai Latte" },
    { name: "Black Coffee", sugar: true },
    { name: "Hot Latte", sugar: true },
    { name: "Caramel Latte" },
  ],
};

// sugar is null for drinks without the option, otherwise 0-4 teaspoons
const order = { tech: null, drink: null, temp: null, sugar: null };
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
    if (sending) return;
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
  btn.addEventListener("click", () => { if (!sending) selectSugar(n); });
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
    btn.innerHTML = `<span class="drink-marker drink-marker--${temp.toLowerCase()}" aria-hidden="true"></span><span>${drink.name}</span>`;
    btn.addEventListener("click", () => {
      if (sending) return;
      order.drink = drink.name;
      order.temp = temp;
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
  btn.addEventListener("click", () => { if (!sending) show(btn.dataset.back); });
});

// ---------- Step 3: submit ----------
const submitBtn = document.getElementById('submit-order');
let sending = false;
let turnstileToken = '';
let visitorId = null;
let storageReady = false;
const ATTEMPT_KEY = 'artsy-drink-attempt-v2';
try {
  visitorId = localStorage.getItem('artsy-drink-visitor-v2');
  if (!/^[0-9a-f-]{36}$/i.test(visitorId || '')) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('artsy-drink-visitor-v2', visitorId);
  }
  sessionStorage.setItem('artsy-storage-check', '1');
  sessionStorage.removeItem('artsy-storage-check');
  storageReady = true;
} catch { storageReady = false; }

function getAttempt() {
  const signature = JSON.stringify(order);
  let previous;
  try { previous = JSON.parse(sessionStorage.getItem(ATTEMPT_KEY)); } catch {}
  if (previous?.signature === signature && typeof previous.requestId === 'string') return previous;
  const attempt = {signature, requestId: crypto.randomUUID(), createdAt: Date.now(), attempted: false};
  sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));
  return attempt;
}
function endpointReady() {
  try {
    const url = new URL(ORDER_ENDPOINT);
    const localPreview = ['127.0.0.1','localhost'].includes(location.hostname) && ['127.0.0.1','localhost'].includes(url.hostname);
    return url.pathname === '/order' && (url.protocol === 'https:' || (localPreview && url.protocol === 'http:')) && !!TURNSTILE_SITE_KEY;
  } catch { return false; }
}
function showSendError(message) {
  const errorBox = document.getElementById('send-error');
  errorBox.textContent = message;
  errorBox.hidden = false;
}
function fallbackMessage() {
  return `We couldn't send your order automatically. Just let ${order.tech} know you'd like a ${order.drink}.`;
}
async function sendAttempt(attempt, token) {
  const response = await fetch(ORDER_ENDPOINT, {
    method: 'POST', credentials: 'omit',
    headers: {'Content-Type':'application/json'},
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({...JSON.parse(attempt.signature), visitorId, requestId: attempt.requestId, createdAt: attempt.createdAt, turnstileToken: token}),
  });
  const data = await response.json().catch(() => ({}));
  return {status:response.status, data};
}
submitBtn.addEventListener('click', async () => {
  if (sending) return;
  document.getElementById('send-error').hidden = true;
  if (!endpointReady() || !storageReady) { showSendError(fallbackMessage()); return; }
  let attempt;
  try { attempt = getAttempt(); } catch { showSendError(fallbackMessage()); return; }
  if (!turnstileToken && !attempt.attempted) {
    showSendError('Please complete the security check, then try again.');
    return;
  }
  sending = true; submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
  let result;
  try {
    attempt.attempted = true;
    sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));
    result = await sendAttempt(attempt, turnstileToken);
    // Look up the same saved request. Never create a second order during a retry.
    for (let i=0; result.status===202 && i<10; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      result = await sendAttempt(attempt, '');
    }
  } catch { result = {status:0,data:{error:'delivery-uncertain'}}; }
  finally {
    resetTurnstile(); sending = false; submitBtn.disabled = false; submitBtn.textContent = 'Order My Drink';
  }
  if (result.status===200 && result.data.ok===true) {
    document.getElementById('done-title').textContent = 'Cheers!';
    const sugarNote = order.sugar ? ` with ${order.sugar} tsp of sugar` : '';
    document.getElementById('done-text').textContent = `Your ${order.drink.toLowerCase()}${sugarNote} is on its way. Sit back, relax, and enjoy your appointment.`;
    show('screen-done'); clearTimeout(resetTimer); resetTimer = setTimeout(resetApp, RESET_AFTER_SECONDS*1000);
  } else if (result.status===403 && result.data.error==='bot-check') {
    attempt.attempted=false;sessionStorage.setItem(ATTEMPT_KEY,JSON.stringify(attempt));
    showSendError('Please complete the security check again, then try once more.');
  } else if (result.status===429) {
    showSendError(`There have been several recent orders. Please ask ${order.tech} for your drink.`);
  } else if (result.status===202 || result.data.error==='delivery-uncertain' || result.status===0) {
    showSendError(`We couldn't confirm your order. Please check with ${order.tech} before ordering again.`);
  } else { showSendError(fallbackMessage()); }
});

window.onloadTurnstileCallback = () => {
  if (!TURNSTILE_SITE_KEY || !window.turnstile) return;
  window.turnstile.render('#turnstile-widget', {
    sitekey:TURNSTILE_SITE_KEY, action:'drink-order', appearance:'interaction-only',
    callback:token=>{turnstileToken=token;},
    'error-callback':()=>{turnstileToken='';},
    'expired-callback':()=>{turnstileToken='';},
  });
};
function resetTurnstile() {
  turnstileToken='';
  if(TURNSTILE_SITE_KEY && window.turnstile)window.turnstile.reset();
}

// ---------- Done / reset ----------
document.getElementById('order-again').addEventListener('click', resetApp);
function resetApp() {
  if(sending)return;
  clearTimeout(resetTimer);
  try { sessionStorage.removeItem(ATTEMPT_KEY); } catch {}
  order.tech=order.drink=order.temp=order.sugar=null;
  document.getElementById('send-error').hidden=true;
  show('screen-staff');
}
