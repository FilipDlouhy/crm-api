const express = require("express");
const ContactController = require("../Controllers/ContactController");

const contactRouter = express.Router();

contactRouter.post("/create-contact", ContactController.createContact);
contactRouter.get("/get-contacts", ContactController.getContacts);
contactRouter.post("/remove-contacts", ContactController.removeContacts);
contactRouter.post("/get-contacts-with-filters", ContactController.getContacts);
contactRouter.post("/update-contact", ContactController.updateContact);
contactRouter.post(
  "/change-contact-hire-status",
  ContactController.changeContactHireStatus
);
contactRouter.post("/change-seniority", ContactController.updateSeniorityLevel);

module.exports = contactRouter;
