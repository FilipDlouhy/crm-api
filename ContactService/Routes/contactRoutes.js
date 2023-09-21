const express = require("express");
const ContactController = require("../Controllers/ContactController");

const contactRouter = express.Router();

contactRouter.post("/create-contact", ContactController.createContact);

module.exports = contactRouter;
