const express = require("express");
const userController = require("../Controllers/UserController");

const userRouter = express.Router();

userRouter.post("/user-create", userController.createUser);
userRouter.get("/get-users", userController.getUsers);
userRouter.post("/get-users-with-filter", userController.getUsers);
userRouter.post("/delete-users", userController.deleteUsers);
userRouter.get("/delete-user", userController.deleteUser);
userRouter.post("/update-users-state", userController.updateUsersState);
userRouter.get("/update-user-state", userController.updateUserState);
userRouter.post("/update-roles", userController.updateUserRoles);
userRouter.post("/update-user", userController.updateUser);
userRouter.get("/get-user-rights", userController.getUserRights);

module.exports = userRouter;
