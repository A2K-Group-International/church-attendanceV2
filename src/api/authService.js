import supabase from "./supabase";

// Login function
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  return data;
}

// Get current user function
export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) return null;
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return data?.user;
}

// Logout function
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// New Register function to sign up a new user
export async function requestAccount({ name, email, password, contactNumber }) {
  // Insert the registration request into the account_pending table
  const { data, error } = await supabase

    .from("account_pending")
    .insert({ name, email, password, contact: contactNumber }); // Use correct field name

  if (error) throw new Error(error.message);

  return data;
}
