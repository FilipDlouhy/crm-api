const uuid = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const UserDto = require("../Models/UserDto");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

const supabaseUrl = "https://yziwqwcjwgvrmxhhruwv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aXdxd2Nqd2d2cm14aGhydXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Mjk2MTA2OCwiZXhwIjoyMDA4NTM3MDY4fQ.eSaBQkg14W38Id_Pcg3LTwGreI91YnPUPR3kKQug6aQ";
const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: false,
});

const createUser = async (req, res) => {
  try {
    const user = req.body; // Extracting user data from the request body
    const uniqueUserId = await uuid.v4(); // Generating a unique user ID
    const hashPassword = await bcrypt.hash(user.password, 10); // Hashing the user's password

    // Creating a new User instance with the provided data
    const newUser = new User(
      user.firstName,
      user.lastName,
      user.email,
      user.telNumber,
      hashPassword,
      uniqueUserId
    );

    // Inserting the new user into the 'user' table in the Supabase database
    const { data, error } = await supabase.from("user").insert([
      {
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        tel_number: newUser.telNumber,
        password: newUser.password,
        user_id: newUser.userId,
        roles: newUser.roles,
      },
    ]);
    // If there's an error, log it and send a 500 status code with an error message
    if (error) {
      console.error("Error creating user:", error);
      res.status(200).json({
        error: "Please fill email with different one this is already taken",
      });
    } else {
      // If there's no error, send a 201 status code with a success message
      const userDto = new UserDto(
        newUser.firstName,
        newUser.lastName,
        newUser.email,
        newUser.telNumber,
        newUser.roles,
        newUser.userId,
        newUser.state,
        new Date()
      );

      res.status(201).json(userDto);
    }
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
};

const getUsers = async (req, res) => {
  try {
    // Get the page number from the request body or query parameters
    const page = req.body.page || req.query.page;

    // Create a Supabase query to fetch users with specified fields and pagination
    let query = supabase
      .from("user")
      .select(
        "tel_number, roles, user_id, state, created_at, email, first_name, last_name",
        { count: "exact" }
      )
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

    // Execute the query to fetch users, including count of total users
    const { data, error, count } = await query;

    // If there's an error, log it and send a 500 status code with an error message
    if (error) {
      console.error("Error fetching users:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching users" });
    }

    // If there's no error, send a 200 status code with the user data and total count
    res.status(200).json({ data: data, count: count });
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
};

const deleteUsers = async (req, res) => {
  try {
    // Delete users with the specified IDs using Supabase

    // Attempt to delete users using Supabase
    const { data, error } = await supabase
      .from("user") // Replace with the actual table name where users are stored
      .delete()
      .in("user_id", req.body.users); // Delete users with matching IDs specified in the request body

    // Check if there was an error during the deletion process
    if (error) {
      // Handle the error (logging it in this case)

      console.log(error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Failed to delete the users" });
    }

    // If deletion is successful, return a 200 status with a success message
    return res.status(200).json({ error: false, message: "Users deleted" });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Delete the user with the specified ID using Supabase

    // Attempt to delete the user with the specified user_id using Supabase
    const { data, error } = await supabase
      .from("user") // Replace with the actual table name where users are stored
      .delete()
      .in("user_id", [req.query.userId]); // Delete the user with the matching ID specified in the query parameter

    // Check if there was an error during the deletion process
    if (error) {
      // Handle the error (logging it in this case)

      console.log(error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Failed to delete the user" });
    }

    // If deletion is successful, return a 200 status with a success message
    return res.status(200).json({ error: false, message: "User deleted" });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateUsersState = async (req, res) => {
  try {
    // Update the state of users with the specified IDs using Supabase

    // Attempt to update user states using Supabase
    const { data, error } = await supabase
      .from("user") // Replace with the actual table name where users are stored
      .update({ state: req.body.userState }) // Update the 'state' field with the value from the request body
      .in("user_id", req.body.users); // Update users with matching IDs specified in the request body

    // Check if there was an error during the update process
    if (error) {
      // Handle the error (logging it in this case)

      console.log(error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Failed to update the users" });
    }

    // If the update is successful, return a 200 status with a success message
    return res.status(200).json({ error: false, message: "Users updated" });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserState = async (req, res) => {
  try {
    // Update the state of the user with the specified ID using Supabase

    // Attempt to update the user's state using Supabase
    const { data, error } = await supabase
      .from("user") // Replace with the actual table name where users are stored
      .update({ state: req.query.userState }) // Update the 'state' field with the value from the query parameter
      .in("user_id", [req.query.userId]); // Update the user with the matching ID specified in the query parameter

    // Check if there was an error during the update process
    if (error) {
      // Handle the error (logging it in this case)

      console.log(error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Failed to update the user" });
    }

    // If the update is successful, return a 200 status with a success message
    return res.status(200).json({ error: false, message: "User updated" });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserRoles = async (req, res) => {
  try {
    // Fetch the current roles of specified users from the database
    const { data: currentRoles, error } = await supabase
      .from("user")
      .select("user_id, roles")
      .in("user_id", req.body.users);

    if (error) {
      console.error(error);
      return;
    }

    let updatedUsers;

    if (req.body.add) {
      // If adding roles, combine roles and remove duplicates
      updatedUsers = currentRoles.map((user) => {
        // Create a Set to store unique role_id values
        const uniqueRoleIds = new Set();

        // Combine the existing roles with the new roles
        const combinedRoles = [...req.body.roles, ...user.roles];

        // Filter to keep only unique roles based on role_id
        const uniqueRoles = combinedRoles.filter((role) => {
          if (!uniqueRoleIds.has(role.role_id)) {
            uniqueRoleIds.add(role.role_id);
            return true;
          }
          return false;
        });

        return {
          ...user,
          roles: uniqueRoles,
        };
      });
    } else {
      // If removing roles, filter out specified role IDs
      const roleIdsToRemove = req.body.roles.map((role) => role.role_id);

      updatedUsers = currentRoles.map((user) => {
        // Filter out roles to be removed
        const updatedRoles = user.roles
          .map((role) => {
            if (!roleIdsToRemove.includes(role.role_id)) {
              return role;
            }
          })
          .filter((role) => role != null);

        return {
          ...user,
          roles: updatedRoles,
        };
      });
    }

    const currentUserId = jwt.decode(req.cookies.token);
    let isCurrentChanged = false;

    // Update the roles for each user in the database
    for (const user of updatedUsers) {
      if (user.user_id === currentUserId) {
        isCurrentChanged = true;
      }
      const { error } = await supabase
        .from("user")
        .update({ roles: user.roles })
        .eq("user_id", user.user_id);

      if (error) {
        console.error(error);
        return;
      }
    }

    return res.status(200).json({
      error: false,
      message: req.body.add ? "Roles added" : "Roles deleted",
      updatedUsers: updatedUsers,
      isCurrentChanged: isCurrentChanged,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      error: true,
      message: req.body.add
        ? "Error while adding roles"
        : "Error while deleting roles",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    // Decode the current user's ID from the JWT token stored in cookies
    const currentUserId = jwt.decode(req.cookies.token);

    // Initialize a flag to track if the current user's information is being changed
    let isCurrentChanged = false;

    // Attempt to update the user's information using Supabase
    const { data, error } = await supabase
      .from("user") // Replace with the actual table name where user information is stored
      .update({
        roles: req.body.roles,
        email: req.body.email,
        last_name: req.body.last_name,
        first_name: req.body.first_name,
        tel_number: req.body.tel_number,
      })
      .eq("user_id", req.body.user_id); // Update the user with the matching user_id specified in the request body

    // Check if the user being updated is the current user
    if (req.body.user_id === currentUserId) {
      isCurrentChanged = true;
    }

    // Check if there was an error during the update process
    if (error) {
      // Handle the error (logging it in this case)

      console.log(error);

      // Return a 200 status with an error message indicating the failure
      return res.status(200).json({ error: "Failed to update the user" });
    }

    // If the update is successful, return a 200 status with a success message and the flag indicating if the current user's information changed
    return res.status(200).json({
      error: false,
      isCurrentChanged: isCurrentChanged,
    });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUserRights = async (req, res) => {
  try {
    // Decode the current user's ID from the JWT token stored in cookies
    const currentUserId = jwt.decode(req.cookies.token);

    // Fetch the roles of the current user from the database
    const { data, error } = await supabase
      .from("user") // Replace with the actual table name where user information is stored
      .select("roles")
      .eq("user_id", currentUserId) // Select the user with the matching user_id
      .single(); // Expect a single user as the result

    // Extract the role IDs from the user's roles
    const roleIds = data.roles.map((role) => {
      return role.role_id;
    });

    // Fetch the rights associated with the user's roles from the database
    const { data: rights, error: roleError } = await supabase
      .from("role") // Replace with the actual table name where role information is stored
      .select("rights")
      .in("role_id", roleIds); // Select roles with matching role IDs

    // Check for errors in fetching roles or rights
    if (error || roleError) {
      console.error(error || roleError);
      return res.status(200).json({ error: "Error while fetching rights" });
    }

    // Return a 200 status with the retrieved rights associated with the user's roles
    return res.status(200).json({ rights: rights });
  } catch (error) {
    // If there's an error in the try block, log it and return a 500 status with an error message
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUser,
  getUsers,
  deleteUsers,
  deleteUser,
  updateUsersState,
  updateUserState,
  updateUserRoles,
  updateUser,
  getUserRights,
};
