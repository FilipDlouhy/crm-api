const uuid = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const UserDto = require("../Models/UserDto");
const { createClient } = require("@supabase/supabase-js");

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
        role_ids: newUser.roles,
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
        newUser.firstName + " " + newUser.lastName,
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
    let query = supabase
      .from("user")
      .select(
        "tel_number, role_ids, user_id, state, created_at, email, first_name, last_name"
      );

    query = query.limit(40);

    if (req.body.filters != null) {
      req.body.filters.map((filter) => {
        console.log(filter);
        query = query.ilike(filter.filterName, `%${filter.filterValue}%`);
      });
    }

    if (req.body.sortables != null) {
      req.body.sortables.forEach((sortable) => {
        query = query.order(sortable.filterName, {
          ascending: sortable.ascending,
        });
      });
    }
    const { data, error } = await query;
    console.log("FUUU");

    // If there's an error, log it and send a 500 status code with an error message
    if (error) {
      console.error("Error fetching users:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching users" });
    }

    // If there's no error, send a 200 status code with the user data
    res.status(200).json(data);
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
};

module.exports = {
  createUser,
  getUsers,
};
