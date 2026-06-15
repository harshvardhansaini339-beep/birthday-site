console.log("APP.JS LOADED");
  const supabaseClient = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);
  const store = {
  details: "birthdaySite.details",
  memories: "birthdaySite.memories",
  wishes: "birthdaySite.wishes",
  card: "birthdaySite.card",
};

const defaultPassword = "Daisies";
let sitePassword = defaultPassword;

const $ = (id) => document.getElementById(id);

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const defaultHint = "Your Fav Flowerr";
const sharePath = "/agifttomypreciousbestie";
let backgroundAudio = null;
const musicDbName = "birthdaySite.media";
const musicStoreName = "files";
const musicKey = "backgroundSong";

 function useShareUrl() {
  const isRootPage =
    location.pathname === "/" ||
    location.pathname.endsWith("/index.html");

  if (isRootPage && history.replaceState) {
    history.replaceState(
      null,
      "",
      `${sharePath}${location.search}${location.hash}`
    );
  }
}

function openMusicDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(musicDbName, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(musicStoreName);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getMusic() {
  const db = await openMusicDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(musicStoreName, "readonly");
    const request = transaction.objectStore(musicStoreName).get(musicKey);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}
function currentPassword() {
  return sitePassword;
}

function unlockSite() {
  document.body.classList.remove("locked");
  $("siteShell").removeAttribute("aria-hidden");
  sessionStorage.setItem("birthdaySite.unlocked", "true");
  confettiBurst();
  startBackgroundSong();
}

async function setupBackgroundSong() {
  const music = await getMusic();
  const toggle = $("musicToggle");
  if (!music?.blob || !toggle) return;

  backgroundAudio = new Audio(URL.createObjectURL(music.blob));
  backgroundAudio.loop = true;
  backgroundAudio.volume = 0.42;
  toggle.hidden = false;
  toggle.textContent = "Play song";

  toggle.addEventListener("click", async () => {
    if (!backgroundAudio) return;
    if (backgroundAudio.paused) {
      try {
        await backgroundAudio.play();
        toggle.textContent = "Pause song";
      } catch {
        toggle.textContent = "Tap to play song";
      }
    } else {
      backgroundAudio.pause();
      toggle.textContent = "Play song";
    }
  });
}

async function startBackgroundSong() {
  if (!backgroundAudio) return;

  try {
    await backgroundAudio.play();
    $("musicToggle").textContent = "Pause song";
  } catch {
    $("musicToggle").textContent = "Tap to play song";
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function applyDetails(details) {
  if (details.Linea) {
    $("heroName").textContent = `Happy 21st Birthday, ${details.Linea}`;
  }

  if (details.introNote && $("visitorIntroNote")) {
    $("visitorIntroNote").textContent = details.introNote;
  }

  if ($("Linea")) $("Linea").value = details.Linea || "";
  if ($("Harshie")) $("Harsie").value = details.Harshie || "";
  if ($("password")) $("password").value = details.password || "";
  if ($("passwordHint")) $("passwordHint").value = details.passwordHint || "";
  if ($("introNote")) $("introNote").value = details.introNote || "";
  $("gateHint").textContent = `Hint: ${details.passwordHint || defaultHint}.`;
  $("previewSignature").textContent = details.creatorName
    ? `with love, ${details.creatorName}`
    : "with love, your creator";
}

function renderPolaroids() {
  const memories = read(store.memories, []);
  const wall = $("memoryWall");
  wall.innerHTML = "";

  if (!memories.length) {
    wall.innerHTML = `<div class="empty-note">Add photos and they will pop out as polaroids.</div>`;
    return;
  }

  const template = $("polaroidTemplate");
  memories.forEach((item, index) => {
    const node = template.content.cloneNode(true);
    const figure = node.querySelector("figure");
    const image = node.querySelector("img");
    const caption = node.querySelector("figcaption");
    figure.style.setProperty("--tilt", `${[-3, 2, -1, 3, -2][index % 5]}deg`);
    image.src = item.src;
    caption.textContent = item.caption || "write a caption";
    caption.addEventListener("input", () => {
      const updated = read(store.memories, []);
      updated[index].caption = caption.textContent.trim();
      write(store.memories, updated);
    });
    wall.appendChild(node);
  });
}

function renderWishes() {
  const wishes = read(store.wishes, [
    {
      name: "Birthday committee",
      text: "May 21 bring you soft mornings, loud laughter, lucky surprises, and excellent cake.",
    },
  ]);
  const list = $("wishList");
  list.innerHTML = "";

  wishes.forEach((wish) => {
    const item = document.createElement("article");
    item.className = "wish";
    item.innerHTML = `<strong></strong><p></p>`;
    item.querySelector("strong").textContent = wish.name;
    item.querySelector("p").textContent = wish.text;
    list.appendChild(item);
  });
}

function renderCard() {
  const card = read(store.card, {});
  if ($("cardTitle")) $("cardTitle").value = card.title || "";
  if ($("cardText")) $("cardText").value = card.text || "";

  if (card.title) $("previewTitle").textContent = card.title;
  if (card.text) $("previewText").textContent = card.text;
}

async function addImages(input, key, mapper) {
  const files = [...input.files].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  const existing = read(key, []);
  const incoming = await Promise.all(files.map(fileToDataUrl));
  write(key, [...existing, ...incoming.map(mapper)]);
  input.value = "";
}

function confettiBurst() {
  const colors = ["#ff7fb3", "#fff0a8", "#b9f4df", "#bde7ff", "#8d2355"];
  for (let i = 0; i < 70; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1800);
  }
}

if ($("detailsForm")) {
  $("detailsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const details = {
      friendName: $("Linea").value.trim(),
      creatorName: $("Harshie").value.trim(),
      password: $("Daisies").value.trim(),
      passwordHint: $("Your Fav Flowerr").value.trim(),
      introNote: $("introNote").value.trim(),
    };
    write(store.details, details);
    applyDetails(details);
    $("heroMessage").textContent = details.introNote || $("heroMessage").textContent;
  });
}

$("gateForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if ($("gatePassword").value.trim() === currentPassword()) {
    $("gateMessage").textContent = "";
    unlockSite();
  } else {
    $("gateMessage").textContent = "That is not the birthday password yet.";
  }
});

$("memoryUpload").addEventListener("change", async (event) => {
  await addImages(event.target, store.memories, (src) => ({ src, caption: "write a caption" }));
  renderPolaroids();
});

$("clearMemories").addEventListener("click", () => {
  write(store.memories, []);
  renderPolaroids();
});

$("cutCake").addEventListener("click", () => {
  $("cakeShape").classList.toggle("cut");
  const isCut = $("cakeShape").classList.contains("cut");
  $("cakeMessage").textContent = isCut
    ? "Cake officially cut. Everyone gets the corner piece today."
    : "Tap the button for confetti and a slice.";
  if (isCut) confettiBurst();
});

$("wishForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("wishName").value.trim() || "Someone who loves you";
  const text = $("wishText").value.trim();
  if (!text) return;

  const wishes = read(store.wishes, []);
  write(store.wishes, [{ name, text }, ...wishes]);
  $("wishName").value = "";
  $("wishText").value = "";
  renderWishes();
});

if ($("cardForm")) {
  $("cardForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const card = {
      title: $("cardTitle").value.trim(),
      text: $("cardText").value.trim(),
    };
    write(store.card, card);
    renderCard();
  });
}
  (async () => {
  const giftId = new URLSearchParams(window.location.search).get("gift");

  console.log("Gift ID:", giftId);

  if (!giftId) return;

  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .select("*")
    .eq("id", giftId)
    .single();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error || !data) return;

  sitePassword = data.password || defaultPassword;
  console.log("Password from DB:", sitePassword);
    
  applyDetails({
  friendName: data.friend_name,
  creatorName: data.creator_name,
  password: data.password,
  passwordHint: data.password_hint,
  introNote: data.intro_note
});

})();
renderPolaroids();
renderWishes();
renderCard();
setupBackgroundSong();
useShareUrl();

if (sessionStorage.getItem("birthdaySite.unlocked") === "true") {
  document.body.classList.remove("locked");
  $("siteShell").removeAttribute("aria-hidden");
  startBackgroundSong();
} else {
  $("gatePassword").focus();
} 
