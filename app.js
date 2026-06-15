console.log("APP.JS LOADED");

/* -----------------------------
   1. URL + GIFT ID (FIRST THING)
------------------------------*/
const url = new URL(window.location.href);
const giftId = url.searchParams.get("gift");

console.log("Gift ID:", giftId);

/* -----------------------------
   2. SUPABASE CLIENT
------------------------------*/
const supabaseClient = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);

/* -----------------------------
   3. CONFIG / STORAGE KEYS
------------------------------*/
const store = {
  details: "birthdaySite.details",
  memories: "birthdaySite.memories",
  wishes: "birthdaySite.wishes",
  card: "birthdaySite.card",
};

const defaultPassword = "cake21";
let sitePassword = defaultPassword;

const sharePath = "/agifttomypreciousbestie";

/* -----------------------------
   4. SHARE LINK (SAFE)
------------------------------*/
let shareLink = null;

if (giftId) {
  shareLink = `https://birthday-site-zeta-seven.vercel.app${sharePath}?gift=${giftId}`;
}

console.log("Share Link:", shareLink);

/* -----------------------------
   5. DOM HELPER
------------------------------*/
const $ = (id) => document.getElementById(id);

/* -----------------------------
   6. LOCAL STORAGE HELPERS
------------------------------*/
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

/* -----------------------------
   7. URL CLEANUP (NO ? BUG)
------------------------------*/
function useShareUrl() {
  const isRootPage =
    location.pathname === "/" ||
    location.pathname.endsWith("/index.html");

  if (!isRootPage) return;

  const search = window.location.search;
  const cleanSearch = search && search.length > 1 ? search : "";

  history.replaceState(
    null,
    "",
    `${sharePath}${cleanSearch}`
  );
}

/* -----------------------------
   8. SUPABASE LOADER
------------------------------*/
async function loadFromSupabase(id) {
  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .select("*")
    .eq("id", id)
    .single();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error || !data) return;

  sitePassword = data.password || defaultPassword;

  applyDetails({
    functionrenderPolaroids() {
  const memories = read(store.memories, []);
  const wall = $("memoryWall");
  if (!wall) return;

  wall.innerHTML = "";

  if (!memories.length) {
    wall.innerHTML =
      `<div class="empty-note">Add photos and they will pop out as polaroids.</div>`;
    return;
  }

  memories.forEach((item, index) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const caption = document.createElement("figcaption");

    img.src = item.src;
    caption.textContent = item.caption || "write a caption";

    figure.style.transform = `rotate(${[-3, 2, -1, 3, -2][index % 5]}deg)`;

    figure.appendChild(img);
    figure.appendChild(caption);
    wall.appendChild(figure);
  });
}

function renderWishes() {
  const wishes = read(store.wishes, []);
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
  const card = read(store.card, {});

  if ($("cardTitle")) $("cardTitle").value = card.title || "";
  if ($("cardText")) $("cardText").value = card.text || "";

  if ($("previewTitle")) $("previewTitle").textContent = card.title || "";
  if ($("previewText")) $("previewText").textContent = card.text || "";
}
    friendName: data.friend_name,
    creatorName: data.creator_name,
    password: data.password,
    passwordHint: data.password_hint,
    introNote: data.intro_note,
  });
}

/* -----------------------------
   9. APPLY DETAILS
------------------------------*/
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

  $("gateHint").textContent =
    `Hint: ${details.passwordHint || "something soft and birthday-ish"}.`;
}

/* -----------------------------
   10. INIT FLOW (IMPORTANT ORDER)
------------------------------*/
(async function init() {

  // STEP 1: load Supabase FIRST
  if (giftId) {
    await loadFromSupabase(giftId);
  }

  // STEP 2: UI render (your existing functions)
  renderPolaroids();
  renderWishes();
  renderCard();

  setupBackgroundSong();

  // STEP 3: URL cleanup LAST
  useShareUrl();

  // STEP 4: unlock state
  if (sessionStorage.getItem("birthdaySite.unlocked") === "true") {
    document.body.classList.remove("locked");
    $("siteShell").removeAttribute("aria-hidden");
    startBackgroundSong();
  } else {
    $("gatePassword").focus();
  }

})();
