console.log("APP V3 LOADED");

/* ---------------- CONFIG ---------------- */
const supabaseClient = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);

const CONFIG = {
  store: {
    details: "birthdaySite.details",
    memories: "birthdaySite.memories",
    wishes: "birthdaySite.wishes",
    card: "birthdaySite.card",
  },
  defaultPassword: "cake21",
  sharePath: "/agifttomypreciousbestie",
};

/* ---------------- HELPERS ---------------- */
const $ = (id) => document.getElementById(id);

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

/* ---------------- GIFT ID ---------------- */
function getGiftId() {
  const url = new URL(window.location.href);

  const queryGift = url.searchParams.get("gift");
  if (queryGift) return queryGift;

  const match = url.pathname.match(/\/agifttomypreciousbestie\/(.+)/);
  return match ? match[1] : null;
}

const giftId = getGiftId();
console.log("Gift ID:", giftId);

/* ---------------- STATE ---------------- */
const state = {
  password: CONFIG.defaultPassword,
  error: null,
};

/* ---------------- SUPABASE ---------------- */
async function fetchGift(id) {
  if (!id) return null;

  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Supabase error:", error);
    state.error = "Gift not found";
    return null;
  }

  return data;
}

/* ---------------- APPLY DATA ---------------- */
function applyDetails(d) {
  if (!d) return;

  const hero = $("heroName");
  if (hero && d.friend_name) {
    hero.textContent = `Happy 21st Birthday, ${d.friend_name}`;
  }

  const intro = $("visitorIntroNote");
  if (intro) intro.textContent = d.intro_note || "";

  const friend = $("friendName");
  if (friend) friend.value = d.friend_name || "";

  const creator = $("creatorName");
  if (creator) creator.value = d.creator_name || "";

  const pass = $("password");
  if (pass) pass.value = d.password || "";

  const hint = $("passwordHint");
  if (hint) hint.value = d.password_hint || "";
}

/* ---------------- RENDER UI ---------------- */
function renderPolaroids() {
  const memories = read(CONFIG.store.memories, []);
  const wall = $("memoryWall");
  if (!wall) return;

  wall.innerHTML = "";

  memories.forEach((m, i) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    const cap = document.createElement("figcaption");

    img.src = m.src;
    cap.textContent = m.caption || "";

    fig.style.transform = `rotate(${[-3, 2, -1, 3, -2][i % 5]}deg)`;

    fig.appendChild(img);
    fig.appendChild(cap);
    wall.appendChild(fig);
  });
}

function renderWishes() {
  const wishes = read(CONFIG.store.wishes, []);
  const list = $("wishList");
  if (!list) return;

  list.innerHTML = "";

  wishes.forEach((w) => {
    const el = document.createElement("article");
    el.innerHTML = `<strong>${w.name}</strong><p>${w.text}</p>`;
    list.appendChild(el);
  });
}

function renderCard() {
  const card = read(CONFIG.store.card, {});

  if ($("cardTitle")) $("cardTitle").value = card.title || "";
  if ($("cardText")) $("cardText").value = card.text || "";

  if ($("previewTitle")) $("previewTitle").textContent = card.title || "";
  if ($("previewText")) $("previewText").textContent = card.text || "";
}

/* ---------------- UI STATES ---------------- */
function showLoading() {
  const el = $("loadingScreen");
  if (el) el.style.display = "flex";
}

function hideLoading() {
  const el = $("loadingScreen");
  if (el) el.style.display = "none";
}

function showError(msg) {
  const el = $("errorScreen");
  if (el) {
    el.style.display = "flex";
    el.textContent = msg;
  }
}

/* ---------------- INIT ---------------- */
(async function init() {
  showLoading();

  try {
    let data = null;

    if (giftId) {
      data = await fetchGift(giftId);
    }

    if (data) {
      state.password = data.password || CONFIG.defaultPassword;
      applyDetails(data); // ✅ FIXED (was missing before)
    }

    // render AFTER data
    renderPolaroids();
    renderWishes();
    renderCard();

    // unlock state
    if (sessionStorage.getItem("birthdaySite.unlocked")) {
      document.body.classList.remove("locked");
      $("siteShell")?.removeAttribute("aria-hidden");
    }

    // clean URL
    history.replaceState(
      null,
      "",
      giftId
        ? `${CONFIG.sharePath}/${giftId}`
        : CONFIG.sharePath
    );

  } catch (err) {
    console.error(err);
    showError("Something went wrong loading the gift 💔");
  } finally {
    hideLoading();
  }
})();
