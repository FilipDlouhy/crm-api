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

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

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

app.use("/", authRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
