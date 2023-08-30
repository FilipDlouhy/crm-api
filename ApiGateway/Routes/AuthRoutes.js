const express = require("express");
const authController = require("../Controllers/AuthController");

const authRouter = express.Router();

authRouter.post("/create-user-from-login", authController.createUser);
authRouter.post("/login-from-login", authController.loginUser);
authRouter.get("/check-token-from-login", authController.checkLoginToken);

module.exports = authRouter;
