const uuid = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
const cookie = require("cookie"); // Import the cookie module

const supabaseUrl = "https://yziwqwcjwgvrmxhhruwv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6aXdxd2Nqd2d2cm14aGhydXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Mjk2MTA2OCwiZXhwIjoyMDA4NTM3MDY4fQ.eSaBQkg14W38Id_Pcg3LTwGreI91YnPUPR3kKQug6aQ";
const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: false,
});

const createUser = async (req, res) => {};

const logSession = async (req, res) => {};

module.exports = {
  createUser,
  logSession,
};
