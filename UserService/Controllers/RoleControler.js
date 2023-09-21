const uuid = require("uuid");
const Role = require("../Models/RoleModel");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yziwqwcjwgvrmxhhruwv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aXdxd2Nqd2d2cm14aGhydXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Mjk2MTA2OCwiZXhwIjoyMDA4NTM3MDY4fQ.eSaBQkg14W38Id_Pcg3LTwGreI91YnPUPR3kKQug6aQ";
const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: false,
});

const createRole = async (req, res) => {
  try {
    const uniqueRoleId = await uuid.v4();

    const role = new Role(req.body.roleName, req.body.rights, uniqueRoleId);

    // Inserting the new user into the 'user' table in the Supabase database
    const { data, error } = await supabase.from("role").insert([
      {
        rights: role.rights,
        role_name: role.role_name,
        role_id: role.role_id,
      },
    ]);

    // If there's an error, log it and send a 500 status code with an error message
    if (error) {
      console.error("Error creating user:", error);
      res.status(200).json({
        error: "Please fill role name with different one this is already taken",
      });
    } else {
      // If there's no error, send a 201 status code with a success message

      res.status(200).json(role);
    }
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the role" });
  }
};

const getRoles = async (req, res) => {
  try {
    // Get the page number from the request body or query parameters
    const page = req.body.page || req.query.page;

    // Create a Supabase query to fetch roles with specified fields and pagination
    let query = supabase
      .from("role")
      .select("rights, created_at, role_name, role_id", { count: "exact" })
      .range((page - 1) * 25, page * 25 - 1);

    // Check if there are filters in the request and apply them using ilike (case-insensitive search)
    if (req.body.filters != null && req.body.filters.length > 0) {
      req.body.filters.map((filter) => {
        query = query.ilike(filter.filterName, `%${filter.filterValue}%`);
      });
    }

    // Check if there are sortable fields in the request and apply sorting
    if (req.body.sortables != null && req.body.sortables.length > 0) {
      req.body.sortables.forEach((sortable) => {
        query = query.order(sortable.filterName, {
          ascending: sortable.ascending,
        });
      });
    }

    // Execute the query to fetch roles, including count of total roles
    const { data, error, count } = await query;

    // If there's an error, log it and send a 500 status code with an error message
    if (error) {
      console.error("Error fetching roles:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching roles" });
    }

    // If there's no error, send a 200 status code with the role data and total count
    res.status(200).json({ data: data, count: count });
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "An error occurred while fetching roles" });
  }
};

const deleteRoles = async (req, res) => {
  try {
    // Delete roles with the specified IDs using Supabase

    // Attempt to delete roles using Supabase
    const { data, error } = await supabase
      .from("role") // Replace with the actual table name where roles are stored
      .delete()
      .in("role_id", req.body.roles); // Delete roles with matching IDs specified in the request body

    // Check if there was an error during the deletion process
    if (error) {
      return res.status(200).json({ error: "Failed to delete the roles" });
    }

    // If deletion is successful, return a 200 status with a success message
    return res.status(200).json({ error: false, message: "Roles deleted" });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteRole = async (req, res) => {
  try {
    // Delete the role with the specified ID using Supabase

    // Attempt to delete the role using Supabase
    const { data, error } = await supabase
      .from("role") // Replace with the actual table name where roles are stored
      .delete()
      .in("role_id", [req.query.roleId]); // Delete the role with the matching ID specified in the query parameter

    // Check if there was an error during the deletion process
    if (error) {
      // Handle the error (logging it in this case)

      console.log(error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Failed to delete the role" });
    }

    // If deletion is successful, return a 200 status with a success message
    return res.status(200).json({ error: false, message: "Role deleted" });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateRole = async (req, res) => {
  try {
    // Update a role in the database using Supabase

    // Attempt to update the role with the specified role_id using Supabase
    const { data, error } = await supabase
      .from("role") // Replace with the actual table name where roles are stored
      .update({
        role_name: req.body.role_name, // Update the role_name field with the value from the request body
        rights: req.body.rights, // Update the rights field with the value from the request body
      })
      .in("role_id", [req.body.role_id]); // Update the role with the matching role_id specified in the request body

    // Check if there was an error during the update process
    if (error) {
      // Handle the error (logging it in this case)

      console.error("Error updating roles:", error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Error while updating roles" });
    }

    // If the update is successful, return a 200 status with no error message
    return res.status(200).json({ error: false });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createRole,
  getRoles,
  deleteRoles,
  deleteRole,
  updateRole,
};
