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

const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method === "POST") {
    let key =
      "__express__" + (req.originalUrl || req.url) + JSON.stringify(req.body);
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
    let key = "__express__" + (req.originalUrl || req.url);
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

// Use the proxy middleware
app.use("/user", limiter);

app.use(userServiceProxy);

app.use("/", cacheMiddleware(15), authRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
