const supabase = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);
const store = {
  details: "birthdaySite.details",
  card: "birthdaySite.card",
};

const $ = (id) => document.getElementById(id);
const musicDbName = "birthdaySite.media";
const musicStoreName = "files";
const musicKey = "backgroundSong";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

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

async function saveMusic(file) {
  const db = await openMusicDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(musicStoreName, "readwrite");
    const request = transaction.objectStore(musicStoreName).put(
      {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
      },
      musicKey,
    );
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function removeMusic() {
  const db = await openMusicDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(musicStoreName, "readwrite");
    const request = transaction.objectStore(musicStoreName).delete(musicKey);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}
async function applyPreview() {
  const details = read(store.details, {});
  const card = read(store.card, {});
  const music = await getMusic();

  $("friendName").value = details.friendName || "";
  $("creatorName").value = details.creatorName || "";
  $("password").value = details.password || "";
  $("passwordHint").value = details.passwordHint || "";
  $("introNote").value = details.introNote || "";
  $("cardTitle").value = card.title || "";
  $("cardText").value = card.text || "";

  $("previewTitle").textContent =
    card.title || "To my favorite human";

  $("previewText").textContent =
    card.text ||
    "May your day be full of cake, chaos, cozy hugs, pretty skies, and people who love you loudly.";

  $("previewSignature").textContent =
    details.creatorName
      ? `with love, ${details.creatorName}`
      : "with love, your creator";

  $("songStatus").textContent = music?.name
    ? `Current song: ${music.name}`
    : "No song selected yet.";
}
$("creatorDetailsForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const { data, error } = await supabase
    .from("birthday_settings")
    .insert({
      friend_name: $("friendName").value.trim(),
      creator_name: $("creatorName").value.trim(),
      password: $("password").value.trim(),
      password_hint: $("passwordHint").value.trim(),
      intro_note: $("introNote").value.trim()
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    $("detailsSaveNote").textContent = error.message;
    return;
  }

  $("detailsSaveNote").textContent = "Saved to Supabase!";

  alert(
    `${location.origin}/agifttomypreciousbestie/?gift=${data.id}`
  );

  applyPreview();
});
$("creatorCardForm").addEventListener("submit", (event) => {
  event.preventDefault();

  write(store.card, {
    title: $("cardTitle").value.trim(),
    text: $("cardText").value.trim(),
  });

  $("cardSaveNote").textContent =
    "Saved. The visitor card is updated.";

  applyPreview();
});

$("creatorMusicForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = $("songFile").files[0];
  if (!file) {
    $("musicSaveNote").textContent = "Choose an audio file first.";
    return;
  }

  try {
    await saveMusic(file);
    localStorage.removeItem("birthdaySite.music");
    $("songFile").value = "";
    $("musicSaveNote").textContent = "Saved. The song will play after the gift page is unlocked.";
    applyPreview();
  } catch {
    $("musicSaveNote").textContent =
      "This song could not be saved here. Try a shorter audio file.";
  }
});

$("removeSong").addEventListener("click", async () => {
  await removeMusic();
  localStorage.removeItem("birthdaySite.music");
  $("songFile").value = "";
  $("musicSaveNote").textContent = 
    "Removed. The gift page will be quiet.";
  applyPreview();
});

applyPreview();
