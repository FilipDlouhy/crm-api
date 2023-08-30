const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const uuid = require("uuid");

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yziwqwcjwgvrmxhhruwv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aXdxd2Nqd2d2cm14aGhydXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Mjk2MTA2OCwiZXhwIjoyMDA4NTM3MDY4fQ.eSaBQkg14W38Id_Pcg3LTwGreI91YnPUPR3kKQug6aQ";
const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: false,
});

const secretKey = "your-secret-key";

// createUser function is an asynchronous function that creates a new user
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
      res.status(201).json({ message: true });
    }
  } catch (error) {
    // If there's an error in the try block, log it and send a 500 status code with an error message
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
};

// loginUser function is an asynchronous function that logs in a user
const loginUser = async (req, res) => {
  const { email, password } = req.body; // Extracting email and password from the request body
  // Fetching the user with the provided email from the 'user' table in the Supabase database
  const { data, error } = await supabase
    .from("user")
    .select("user_id, password")
    .eq("email", email)
    .single();

  // If there's an error, log it and send a 500 status code with an error message
  if (error) {
    console.error("Error fetching user:", error);
    return res.status(200).json({ error: "An email has not been found" });
  }

  // If the user is found and the provided password matches the hashed password in the database
  if (data && bcrypt.compareSync(password, data.password)) {
    // Generate a JSON Web Token with the user's ID
    const token = jwt.sign(data.user_id, secretKey);
    // Set a cookie with the token
    res.cookie("token", token, {
      httpOnly: true, // Set the httpOnly option to true
      maxAge: 30000, // Set maximum age in milliseconds
    });
    console.log(token);
  } else {
    // If the user is not found or the password doesn't match, send a 401 status code with an error message
    return res.status(200).json({ error: "Invalid password" });
  }

  // Send a success message
  res.json({ message: "Login successful" });
};

// checkLoginToken function is an asynchronous function that checks if a JWT token is present and valid
const checkLoginToken = async (req, res, next) => {
  try {
    // Fetch the token from the cookies
    const token = req.cookies.token;
    console.log(token);

    // Check if the token is not present
    if (!token || jwt.verify(token, secretKey) === false) {
      // If the token is not present, send a 401 status code with an error message
      return res.status(200).json({ isLogged: false });
    }

    return res.status(200).json({ isLogged: true });

    // If the token is present, verify the token
  } catch (error) {
    // If there's another error, send a 500 status code with an error message
    console.error("Error checking token:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking the token" });
  }
};

// Exporting the createUser and loginUser functions
module.exports = {
  createUser,
  loginUser,
  checkLoginToken,
};
