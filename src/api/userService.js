import supabase from "./supabase";

// get user role
export async function getUserRole(id) {
  const { data, error } = await supabase
    .from("user_list")
    .select("user_role")
    .eq("user_uuid", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data?.user_role;
}

// Fetch the latest schedule
export async function fetchLatestSchedule() {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .select("schedule, time")
      .order("id", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching schedule:", error.message);
    throw new Error("Failed to load schedule.");
  }
}

//Fetch time
export async function fetchTime(selectedDate) {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .select("schedule, time")
      .eq("schedule", selectedDate);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching schedule:", error.message);
    throw new Error("Failed to load schedule.");
  }
}

//Get all the events
export async function fetchAllEvents() {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching events:", error.message);
    throw new Error("Failed to load events.");
  }
}

// Get private events
export async function fetchPrivateEvents() {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .select("*")
      .eq("schedule_privacy", "public");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching private events: ", error.message);
    throw new Error("Failed to load private events.");
  }
}

// Insert new schedule
export async function insertNewSchedule(schedule, time) {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .insert(schedule, time);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error inserting new schedule:", error.message);
  }
}

const signUp = async (email, password, userData) => {
  setSignUpLoading(true);
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
        user_name: userData.name,
        user_role: "user",
        user_email: email,
        user_password: password,
        user_contact: userData.contact,
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    const { error: updateError } = await supabase
      .from("account_pending")
      .update({ registered: true })
      .eq("id", userData.id);

    if (updateError) {
      throw updateError;
    }

    fetchData();

    return user;
  } catch (error) {
    console.error("Error during sign-up:", error);
  } finally {
    setSignUpLoading(false);
  }
};

// Fetch Approved category
export async function fetchCategory() {
  try {
    const { data, error } = await supabase
      .from("category_list")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching category list: ", error.message);
    throw new Error("Failed to load category list.");
  }
}

export async function DeleteCategory(id) {
  try {
    const { data, error } = await supabase
      .from("category_list")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting category", error);
  }
}

// Handling the update Approved Request Category
export async function RequestCategory(id) {
  try {
    const { data, error } = await supabase
      .from("category_list") // Ensure the table name is correct
      .update({ is_approved: true, request_status: "Approved" }) // Update the is_approved field
      .eq("id", id) // Match the id
      .select(); // return the updated row(s)

    if (error) {
      throw error; // Throw an error if something goes wrong
    }
    return data; // Return the updated data
  } catch (error) {
    console.error("Error executing approval: ", error); // Log any errors
  }
}

// Handling the Reject Request Category

export async function RejectRequestCategory(id) {
  try {
    const { data, error } = await supabase
      .from("category_list") // Ensure the table name is correct
      .update({ is_rejected: true, request_status: "Rejected" }) // Update the is_approved field
      .eq("id", id) // Match the id
      .select(); // return the updated row(s)

    if (error) {
      throw error; // Throw an error if something goes wrong
    }
    return data; // Return the updated data
  } catch (error) {
    console.error("Error executing Rejection: ", error);
  }
}
