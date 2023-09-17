const express = require("express");
const roleController = require("../Controllers/RoleControler");

const roleRouter = express.Router();

roleRouter.post("/role-create", roleController.createRole);
roleRouter.get("/role-get", roleController.getRoles);
roleRouter.post("/roles-delete", roleController.deleteRoles);
roleRouter.get("/role-delete", roleController.deleteRole);
roleRouter.post("/role-get-with-filter", roleController.getRoles);
roleRouter.post("/update-role", roleController.updateRole);

module.exports = roleRouter;
