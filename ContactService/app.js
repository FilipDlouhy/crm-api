const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";
const cache = require("memory-cache");
const contactRoutes = require("./Routes/contactRoutes");

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
    console.log(token);

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

const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method === "POST") {
    let key =
      "express" + (req.originalUrl || req.url) + JSON.stringify(req.body);
    let cachedBody = cache.get(key);
    if (cachedBody) {
      console.log("Cache hit:", key);
      res.send(cachedBody);
      return;
    } else {
      console.log("Cache miss:", key);
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.put(key, body, duration * 1000);
        console.log("Cached:", key);
        res.sendResponse(body);
      };
      next();
    }
  } else {
    let key = "express" + (req.originalUrl || req.url);
    let cachedBody = cache.get(key);
    if (cachedBody) {
      console.log("Cache hit:", key);
      res.send(cachedBody);
      return;
    } else {
      console.log("Cache miss:", key);
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.put(key, body, duration * 1000);
        console.log("Cached:", key);
        res.sendResponse(body);
      };
      next();
    }
  }
};

app.use("/contact", checkLoginToken, cacheMiddleware(30), contactRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
