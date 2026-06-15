console.log("CREATOR LOADED");

const supabaseClient = window.supabase.createClient(
  "https://drjzqnhzhzsvfqebuayo.supabase.co",
  "sb_publishable_duTpTqIM51O6Vprzr531dA_njOUJj4b"
);

const $ = (id) => document.getElementById(id);

async function createGift() {
  const payload = {
    friend_name: $("friendName").value,
    creator_name: $("creatorName").value,
    password: $("password").value,
    password_hint: $("passwordHint").value,
    intro_note: $("introNote").value,
    memories: [],
    wishes: [],
    card: {},
  };

  const { data, error } = await supabaseClient
    .from("birthday_settings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Failed to create gift");
    return;
  }

  const giftId = data.id;

  const link = `${window.location.origin}/agifttomypreciousbestie?gift=${giftId}`;

  console.log("CREATED GIFT:", giftId);
  console.log("SHARE LINK:", link);

  prompt("Copy your link:", link);
}

document.getElementById("createBtn")
  .addEventListener("click", createGift);
