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
