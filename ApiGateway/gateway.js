const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
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
const secretKey = "your-secret-key";

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

// Define your proxy middleware
const userServiceProxy = createProxyMiddleware("/user", {
  target: "http://localhost:7000",
  changeOrigin: true,
  withCredentials: true, // Add this line
  cookieDomainRewrite: false, // Add this line

  // Log cookies sent in request
  onProxyReq: (proxyReq, req, res) => {
    const token = req.cookies.token;
  },
});

app.get("/protected", (req, res) => {
  const token = req.cookies.token;
  console.log(req.cookies.token);
  console.log(token);

  res.json({ message: "Protected route accessed" });
});
// Use the proxy middleware
app.use(userServiceProxy);

app.use("/", authRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
