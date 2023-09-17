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

    console.log(data, error);
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
    const page = req.body.page || req.query.page;

    console.log(page);
    let query = supabase
      .from("role")
      .select("rights, created_at, role_name, role_id", { count: "exact" })
      .range((page - 1) * 25, page * 25 - 1);

    if (req.body.filters != null && req.body.filters.length > 0) {
      req.body.filters.map((filter) => {
        query = query.ilike(filter.filterName, `%${filter.filterValue}%`);
      });
    }

    if (req.body.sortables != null && req.body.sortables.length > 0) {
      req.body.sortables.forEach((sortable) => {
        query = query.order(sortable.filterName, {
          ascending: sortable.ascending,
        });
      });
    }

    const { data, error, count } = await query;

    // If there's an error, log it and send a 500 status code with an error message
    if (error) {
      console.error("Error fetching users:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching roles" });
    }

    // If there's no error, send a 200 status code with the user data
    res.status(200).json({ data: data, count: count });
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching roles" });
  }
};

const deleteRoles = async (req, res) => {
  try {
    // Delete the user with the specified ID using Supabase

    const { data, error } = await supabase
      .from("role") // Replace with the actual table name
      .delete()
      .in("role_id", req.body.roles); // Delete the user with the matching ID

    if (error) {
      return res.status(200).json({ error: "Failed to delete the roles" });
    }

    return res.status(200).json({ error: false, message: "Roles deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteRole = async (req, res) => {
  try {
    // Delete the user with the specified ID using Supabase

    const { data, error } = await supabase
      .from("role") // Replace with the actual table name
      .delete()
      .in("role_id", [req.query.roleId]); // Delete the user with the matching ID

    if (error) {
      // Handle the error

      console.log(error);
      return res.status(200).json({ error: "Failed to delete the role" });
    }

    return res.status(200).json({ error: false, message: "Role deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateRole = async (req, res) => {
  const { data, error } = await supabase
    .from("role")
    .update({ role_name: req.body.role_name, rights: req.body.rights })
    .in("role_id", [req.body.role_id]);
  if (error) {
    console.error("Error updating roles:", error);
    return res.status(200).json({ error: "Error while updating roles" });
  }
  return res.status(200).json({ error: false });
};

module.exports = {
  createRole,
  getRoles,
  deleteRoles,
  deleteRole,
  updateRole,
};
