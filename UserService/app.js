const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./Routes/UserRoutes");
const port = process.env.PORT || 7000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

// checkLoginToken function is an asynchronous function that checks if a JWT token is present and valid
const checkLoginToken = async (req, res, next) => {
  try {
    // Fetch the token from the cookies
    const token = req.cookies.token;
    // Check if the token is not present
    if (!token || jwt.verify(token, secretKey) === false) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      // If the token is present and valid, continue to the next middleware or route
      next();
    }
  } catch (error) {
    // If there's another error, send a 500 status code with an error message
    console.error("Error checking token:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// Apply the checkLoginToken middleware globally to all routes under /user
app.use("/user", checkLoginToken, userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
