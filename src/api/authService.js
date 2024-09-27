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

// // New Register function to sign up a new user
// export async function requestAccount({ name, email, password, contactNumber }) {
//   // Insert the registration request into the account_pending table
//   const { data, error } = await supabase

//     .from("account_pending")
//     .insert({ name, email, password, contact: contactNumber }); // Use correct field name

//   if (error) throw new Error(error.message);

//   return data;
// }

export async function signUp({
  firstName,
  lastName,
  email,
  password,
  contactNumber,
}) {
  try {
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw signUpError;
    }

    const { error: insertError } = await supabase.from("user_list").insert([
      {
        user_uuid: user.user.id,
        user_name: firstName,
        user_last_name: lastName,
        user_role: "user",
        user_email: email,
        user_contact: contactNumber,
        is_confirmed: false,
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    return user;
  } catch (error) {
    console.error("Error during sign-up:", error);
  } finally {
  }
}
