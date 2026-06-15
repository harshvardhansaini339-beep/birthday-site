console.log("CREATOR LOADED");

const supabaseClient = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);

const $ = (id) => document.getElementById(id);

async function createGift() {
  const payload = {
    friend_name: $("friendName")?.value || "",
    creator_name: $("creatorName")?.value || "",
    password: $("password")?.value || "cake21",
    password_hint: $("passwordHint")?.value || "",
    intro_note: $("introNote")?.value || "",
  };

  console.log("SAVING:", payload);

  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("SUPABASE ERROR:", error);
    alert("Save failed (check console)");
    return;
  }

  const giftId = data.id;

  const link = `${window.location.origin}/agifttomypreciousbestie?gift=${giftId}`;

  console.log("CREATED:", giftId);
  prompt("Copy link:", link);
}

document.getElementById("createBtn")?.addEventListener("click", createGift);
