const express = require("express");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the cors middleware
const authRoutes = require("./Routes/AuthRoutes");
const app = express();
const rateLimit = require("express-rate-limit");
const cache = require("memory-cache");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Define a middleware function that handles caching based on the provided duration
const cacheMiddleware = (duration) => (req, res, next) => {
  // Check if the HTTP request method is POST
  if (req.method === "POST") {
    // Create a cache key based on the request URL and the request body (if present)
    let key =
      "express" + (req.originalUrl || req.url) + JSON.stringify(req.body);

    // Try to retrieve the cached response for the given key
    let cachedBody = cache.get(key);

    // If a cached response is found, send it as the HTTP response and return
    if (cachedBody) {
      console.log("Cache hit:", key);
      res.send(cachedBody);
      return;
    } else {
      // If no cached response is found, set up caching for the response
      console.log("Cache miss:", key);

      // Replace the res.send method with custom logic that caches the response
      res.sendResponse = res.send;
      res.send = (body) => {
        // Cache the response body with the specified duration in seconds
        cache.put(key, body, duration * 1000);
        console.log("Cached:", key);
        // Send the response as usual
        res.sendResponse(body);
      };

      // Move to the next middleware or route handler
      next();
    }
  } else {
    // Handle caching for HTTP methods other than POST
    let key = "express" + (req.originalUrl || req.url);

    // Try to retrieve the cached response for the given key
    let cachedBody = cache.get(key);

    // If a cached response is found, send it as the HTTP response and return
    if (cachedBody) {
      console.log("Cache hit:", key);
      res.send(cachedBody);
      return;
    } else {
      // If no cached response is found, set up caching for the response
      console.log("Cache miss:", key);

      // Replace the res.send method with custom logic that caches the response
      res.sendResponse = res.send;
      res.send = (body) => {
        // Cache the response body with the specified duration in seconds
        cache.put(key, body, duration * 1000);
        console.log("Cached:", key);
        // Send the response as usual
        res.sendResponse(body);
      };

      // Move to the next middleware or route handler
      next();
    }
  }
};

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

const userServiceProxy = createProxyMiddleware("/user", {
  target: "http://localhost:7000",
  changeOrigin: true,
  withCredentials: true,
  cookieDomainRewrite: false,
  onProxyReq: fixRequestBody,
});

const contactServiceProxy = createProxyMiddleware("/contact", {
  target: "http://localhost:4000",
  changeOrigin: true,
  withCredentials: true,
  cookieDomainRewrite: false,
  onProxyReq: fixRequestBody,
});

// Use the proxy middleware
app.use("/user", limiter);
app.use("/contact", limiter);

app.use(userServiceProxy);
app.use(contactServiceProxy);

app.use("/", cacheMiddleware(15), authRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
