const express = require("express");
const userController = require("../Controllers/UserController");

const userRouter = express.Router();

userRouter.post("/user-create", userController.createUser);
userRouter.get("/get-users", userController.getUsers);
userRouter.post("/get-users-with-filter", userController.getUsers);

module.exports = userRouter;
