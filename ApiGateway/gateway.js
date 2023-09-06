const express = require("express");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the cors middleware
const authRoutes = require("./Routes/AuthRoutes");
const app = express();

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
app.use(userServiceProxy);

app.use("/", authRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
