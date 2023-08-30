const express = require("express");
const userController = require("../Controllers/UserController");

const userRouter = express.Router();

userRouter.post("/user-create", userController.createUser);
userRouter.get("/log-session", userController.logSession);

module.exports = userRouter;
