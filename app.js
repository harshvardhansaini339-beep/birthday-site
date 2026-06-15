console.log("APP V3 LOADED");

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

function getGiftId() {
  const path = window.location.pathname;

  // supports: /agifttomypreciousbestie/123
  const match = path.match(/\/agifttomypreciousbestie\/(.+)/);
  return match ? match[1] : null;
}

const giftId = getGiftId();

console.log("Gift ID:", giftId);

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

const state = {
  password: CONFIG.defaultPassword,
  loading: true,
  error: null,
};

async function fetchGift(id) {
  if (!id) return null;

  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    state.error = "Gift not found";
    return null;
  }

  return data;
}

function applyDetails(d) {
  if (!d) return;

  const hero = $("heroName");
  if (hero && d.friend_name) {
    hero.textContent = `Happy 21st Birthday, ${d.friend_name}`;
  }

  if ($("visitorIntroNote")) {
    $("visitorIntroNote").textContent = d.intro_note || "";
  }

  if ($("friendName")) $("friendName").value = d.friend_name || "";
  if ($("creatorName")) $("creatorName").value = d.creator_name || "";
  if ($("password")) $("password").value = d.password || "";
  if ($("passwordHint")) $("passwordHint").value = d.password_hint || "";
}

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

    fig.style.transform =
      `rotate(${[-3, 2, -1, 3, -2][i % 5]}deg)`;

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

  wishes.forEach(w => {
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

(async function init() {
  showLoading();

  try {
    // 1. fetch gift
    const data = await fetchGift(giftId);

    if (data) {
      state.password = data.password || CONFIG.defaultPassword;

      applyDetails(data);
    }

    // 2. render UI
    renderPolaroids();
    renderWishes();
    renderCard();

    // 3. unlock logic
    if (sessionStorage.getItem("birthdaySite.unlocked")) {
      document.body.classList.remove("locked");
      $("siteShell")?.removeAttribute("aria-hidden");
    }

    // 4. URL clean
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

