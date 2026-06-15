console.log("APP LOADED");

const supabaseClient = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);

const CONFIG = {
  sharePath: "/agifttomypreciousbestie",
};

const $ = (id) => document.getElementById(id);

function getGiftId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("gift");
}

const giftId = getGiftId();

console.log("Gift ID:", giftId);

async function loadGift(id) {
  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Load error:", error);
    return null;
  }

  return data;
}

function applyGift(data) {
  if (!data) return;

  if ($("heroName")) {
    $("heroName").textContent =
      `Happy Birthday, ${data.friend_name}`;
  }

  if ($("visitorIntroNote")) {
    $("visitorIntroNote").textContent = data.intro_note || "";
  }

  if ($("gatePassword")) {
    $("gatePassword").dataset.realPassword = data.password;
  }
}

/* ---------------- RENDER ---------------- */

function renderWishes(wishes = []) {
  const list = $("wishList");
  if (!list) return;

  list.innerHTML = "";

  wishes.forEach(w => {
    const el = document.createElement("article");
    el.innerHTML = `<strong>${w.name}</strong><p>${w.text}</p>`;
    list.appendChild(el);
  });
}

function renderPolaroids(memories = []) {
  const wall = $("memoryWall");
  if (!wall) return;

  wall.innerHTML = "";

  memories.forEach((m, i) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    const cap = document.createElement("figcaption");

    img.src = m.src;
    cap.textContent = m.caption || "";

    fig.style.transform = `rotate(${[-3,2,-1,3,-2][i%5]}deg)`;

    fig.appendChild(img);
    fig.appendChild(cap);
    wall.appendChild(fig);
  });
}

function renderCard(card = {}) {
  if ($("cardTitle")) $("cardTitle").value = card.title || "";
  if ($("cardText")) $("cardText").value = card.text || "";

  if ($("previewTitle")) $("previewTitle").textContent = card.title || "";
  if ($("previewText")) $("previewText").textContent = card.text || "";
}

/* ---------------- INIT ---------------- */

(async function init() {
  if (!giftId) {
    console.log("No gift ID");
    return;
  }

  const data = await loadGift(giftId);

  if (!data) return;

  applyGift(data);

  renderPolaroids(data.memories);
  renderWishes(data.wishes);
  renderCard(data.card);

  history.replaceState(
    null,
    "",
    `${CONFIG.sharePath}?gift=${giftId}`
  );
})();
