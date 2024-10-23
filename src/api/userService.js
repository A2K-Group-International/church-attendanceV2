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

// const signUp = async (email, password, userData) => {
//   setSignUpLoading(true);
//   try {
//     const { data: user, error: signUpError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (signUpError) {
//       throw signUpError;
//     }

//     const { error: insertError } = await supabase.from("user_list").insert([
//       {
//         user_uuid: user.user.id,
//         user_name: userData.name,
//         user_role: "user",
//         user_email: email,
//         user_password: password,
//         user_contact: userData.contact,
//       },
//     ]);

//     if (insertError) {
//       throw insertError;
//     }

//     const { error: updateError } = await supabase
//       .from("account_pending")
//       .update({ registered: true })
//       .eq("id", userData.id);

//     if (updateError) {
//       throw updateError;
//     }

//     fetchData();

//     return user;
//   } catch (error) {
//     console.error("Error during sign-up:", error);
//   } finally {
//     setSignUpLoading(false);
//   }
// };

// Fetch Approved category
export async function fetchCategory() {
  try {
    const { data, error } = await supabase
      .from("category_list")
      .select("*")
      .order("category_id", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching category list: ", error.message);
    throw new Error("Failed to load category list.");
  }
}

// Fetch Approved SubCategory category
export async function fetchSubCategory(categoryId) {
  try {
    const { data, error } = await supabase
      .from("sub_category_list")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_approved", true);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching sub category list: ", error.message);
    throw new Error("Failed to load sub category list.");
  }
}
export async function fetchNotApprovedSubCategory() {
  try {
    const { data, error } = await supabase
      .from("sub_category_list")
      .select("*")
      .eq("sub_category_status", "Pending");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching sub category list: ", error.message);
    throw new Error("Failed to load sub category list.");
  }
}

export async function DeleteCategory(id) {
  try {
    const { data, error } = await supabase
      .from("category_list")
      .delete()
      .eq("category_id", id);

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
      .from("category_list")
      .update({ is_approved: true, request_status: "Approved" }) // Update the is_approved field
      .eq("category_id", id) // Match the id
      .select(); // return the updated row(s)

    if (error) {
      throw error;
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
      .eq("category_id", id) // Match the id
      .select(); // return the updated row(s)

    if (error) {
      throw error; // Throw an error if something goes wrong
    }
    return data; // Return the updated data
  } catch (error) {
    console.error("Error executing Rejection: ", error);
  }
}

// Handling Volunteer Request Insert Category
export async function InsertRequestCategory(
  category_name,
  requester_id,
  requester_first_name,
  requester_last_name,
  category_description,
) {
  try {
    const { data, error } = await supabase.from("category_list").insert([
      {
        category_name: category_name,
        requester_id: requester_id,
        requester_first_name: requester_first_name,
        requester_last_name: requester_last_name,
        is_approved: false,
        is_rejected: false,
        request_status: "Pending",
        category_description: category_description,
      },
    ]);

    if (error) {
      throw error;
    }
    console.log("Category inserted successfully:", data);
    return data; // Return data for any additional processing
  } catch (error) {
    console.error("Error inserting category:", error.message);
    return { error: error.message };
  }
}

// Handling Volunteer Request Insert Category
export async function InsertRequestSubCategory(
  sub_category_name,
  category_id,
  requester_id,
  requester_first_name,
  requester_last_name,
  sub_category_description,
) {
  try {
    const { data, error } = await supabase.from("sub_category_list").insert([
      {
        sub_category_name: sub_category_name,
        category_id: category_id,
        requester_id: requester_id,
        requester_first_name: requester_first_name,
        requester_last_name: requester_last_name,
        is_approved: false,
        sub_category_description: sub_category_description,
        sub_category_status: "Pending",
      },
    ]);

    if (error) {
      throw error;
    }
    return data; // Return data for any additional processing
  } catch (error) {
    console.error("Error inserting category:", error.message);
    return { error: error.message };
  }
}

// Handle approve sub category
export async function ApproveSubCategory(id) {
  try {
    const { data, error } = await supabase
      .from("sub_category_list")
      .update({ is_approved: true, sub_category_status: "Approved" }) // Update the is_approved field
      .eq("sub_category_id", id) // Match the id
      .select(); // return the updated row(s)

    if (error) {
      throw error;
    }
    return data; // Return the updated data
  } catch (error) {
    console.error("Error executing approval: ", error); // Log any errors
  }
}

// Handling the Reject Request Sub Category
export async function RejectSubCategory(id) {
  try {
    const { data, error } = await supabase
      .from("sub_category_list") // Ensure the table name is correct
      .update({ sub_category_status: "Rejected" }) // Update the is_approved field
      .eq("sub_category_id", id) // Match the id
      .select(); // returns the updated row(s)

    if (error) {
      throw error; // Throw an error if something goes wrong
    }
    return data; // Return the updated data
  } catch (error) {
    console.error("Error executing Rejection: ", error);
  }
}
// Fetch All Sub Category
export async function fetchAllSubCategory() {
  try {
    const { data, error } = await supabase
      .from("sub_category_list")
      .select("*")
      .order("sub_category_id", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching sub category list: ", error.message);
    throw new Error("Failed to load sub category list.");
  }
}

// Get all the events based on selected category
export async function filterEvent(schedule_category) {
  try {
    const query = supabase
      .from("schedule")
      .select("*")
      .order("id", { ascending: false });

    // Add a filter for the category if provided
    if (schedule_category) {
      query.eq("schedule_category", schedule_category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching events:", error.message);
    throw new Error("Failed to load events.");
  }
}

export async function insertSingleAttendee(
  attendee_first_name,
  attendee_last_name,
  telephone,
  selected_event,
  selected_time,
  selected_event_date,
) {
  try {
    const { data, error } = await supabase.from("new_attendance").insert([
      {
        attendee_first_name: attendee_first_name,
        attendee_last_name: attendee_last_name,
        telephone: telephone,
        selected_event: selected_event,
        selected_time: selected_time,
        selected_event_date: selected_event_date,
        attendance_type: "single",
        has_attended: false,
      },
    ]);

    if (error) {
      throw error;
    }
    return data; // Return data for any additional processing
  } catch (error) {
    console.error("Error inserting attendance:", error.message);
    return { error: error.message };
  }
}

export async function insertFamilyAttendee(
  main_applicant_first_name,
  main_applicant_last_name,
  telephone,
  selected_event,
  selected_event_date,
  selected_time,
  attendee,
) {
  try {
    const { error: dataError } = await supabase.from("new_attendance").insert(
      attendee.map((child) => ({
        main_applicant_first_name: main_applicant_first_name,
        main_applicant_last_name: main_applicant_last_name,
        telephone: telephone,
        attendee_first_name: child.first_name,
        attendee_last_name: child.last_name,
        has_attended: false,
        selected_event: selected_event,
        selected_event_date: selected_event_date,
        selected_time: selected_time,
        attendance_type: "family",
      })),
    );

    if (dataError) throw dataError;
  } catch (error) {
    console.error("Error inserting attendance:", error.message);
    return { error: error.message };
  }
}
