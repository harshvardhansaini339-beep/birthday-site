console.log("APP LOADED");

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

const url = new URL(window.location.href);
const giftId = url.searchParams.get("gift");

let sitePassword = CONFIG.defaultPassword;

console.log("Gift system active:", {
  giftId,
  hasGift: !!giftId
});

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

async function loadFromSupabase(id) {
  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(error);
    return;
  }

  sitePassword = data.password || CONFIG.defaultPassword;

  function applyDetails(details) {
  const heroName = $("heroName");
  if (heroName && details.friendName) {
    heroName.textContent =
      `Happy 21st Birthday, ${details.friendName}`;
  }

  const visitorIntro = $("visitorIntroNote");
  if (visitorIntro && details.introNote) {
    visitorIntro.textContent = details.introNote;
  }

  if ($("friendName")) $("friendName").value = details.friendName || "";
  if ($("creatorName")) $("creatorName").value = details.creatorName || "";
  if ($("password")) $("password").value = details.password || "";
  if ($("passwordHint")) $("passwordHint").value = details.passwordHint || "";
  if ($("introNote")) $("introNote").value = details.introNote || "";
}
}

function applyDetails(details) {
  if (details.friendName) {
    $("heroName").textContent =
      `Happy 21st Birthday, ${details.friendName}`;
  }

  if (details.introNote && $("visitorIntroNote")) {
    $("visitorIntroNote").textContent = details.introNote;
  }

  if ($("friendName")) $("friendName").value = details.friendName || "";
  if ($("creatorName")) $("creatorName").value = details.creatorName || "";
  if ($("password")) $("password").value = details.password || "";
  if ($("passwordHint")) $("passwordHint").value = details.passwordHint || "";
  if ($("introNote")) $("introNote").value = details.introNote || "";
}

function renderPolaroids() {
  const memories = read(CONFIG.store.memories, []);
  const wall = $("memoryWall");
  if (!wall) return;

  wall.innerHTML = "";

  memories.forEach((item, index) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const caption = document.createElement("figcaption");

    img.src = item.src;
    caption.textContent = item.caption || "write a caption";

    figure.style.transform =
      `rotate(${[-3, 2, -1, 3, -2][index % 5]}deg)`;

    figure.appendChild(img);
    figure.appendChild(caption);
    wall.appendChild(figure);
  });
}

function renderWishes() {
  const wishes = read(CONFIG.store.wishes, []);
  const list = $("wishList");
  if (!list) return;

  list.innerHTML = "";

  wishes.forEach((wish) => {
    const item = document.createElement("article");
    item.innerHTML = `<strong>${wish.name}</strong><p>${wish.text}</p>`;
    list.appendChild(item);
  });
}

function renderCard() {
  const card = read(CONFIG.store.card, {});

  if ($("cardTitle")) $("cardTitle").value = card.title || "";
  if ($("cardText")) $("cardText").value = card.text || "";

  if ($("previewTitle")) $("previewTitle").textContent = card.title || "";
  if ($("previewText")) $("previewText").textContent = card.text || "";
}

function useShareUrl() {
  const isRoot =
    location.pathname === "/" ||
    location.pathname.endsWith("/index.html");

  if (!isRoot) return;

  const search = window.location.search;
  const clean = search && search.length > 1 ? search : "";

  history.replaceState(
    null,
    "",
    `${CONFIG.sharePath}${clean}`
  );
}

(async function init() {
  // 1. load data FIRST
  if (giftId) {
    await loadFromSupabase(giftId);
     setupBackgroundSong();
  if (sessionStorage.getItem("birthdaySite.unlocked") === "true")
  startBackgroundSong();
  }

  // 2. render UI
  renderPolaroids();
  renderWishes();
  renderCard();

  // 3. fix URL
  function useShareUrl() {
  const isRoot =
    location.pathname === "/" ||
    location.pathname.endsWith("/index.html");

  if (!isRoot) return;

  const search = window.location.search;
  const clean = search && search.startsWith("?gift=") ? search : "";

  history.replaceState(
    null,
    "",
    `${CONFIG.sharePath}${clean}`
  );
}

  // 4. unlock state
  if (sessionStorage.getItem("birthdaySite.unlocked") === "true") {
    document.body.classList.remove("locked");
    $("siteShell").removeAttribute("aria-hidden");
  } else {
    $("gatePassword").focus();
  }
})();
