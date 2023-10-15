const mongoose = require("mongoose");
const ContactModel = require("../Models/ContactModel");
// Define the MongoDB connection URL
const mongoUrl =
  "mongodb+srv://Alexios:Alexios123456789@cluster0.cduhy9n.mongodb.net/ContactService?retryWrites=true&w=majority";

// Define the function to create a contact
const createContact = async (req, res) => {
  try {
    let contact;

    switch (req.body.contact_type) {
      case "vendor":
      case "customer":
        if (req.body.organization_or_person === "person") {
          contact = new ContactModel.Contact({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            address: req.body.address,
            organization_or_person: req.body.organization_or_person,
            tel_number: req.body.tel_number,
            contact_roles: [req.body.contact_type],
            contact_id: req.body.contact_id,
            worker_role: {},
            seniority: "",
            hired: false,
          });
        } else if (req.body.organization_or_person === "organization") {
          contact = new ContactModel.Contact({
            organization_name: req.body.organization_name,
            email: req.body.email,
            address: req.body.address,
            organization_or_person: req.body.organization_or_person,
            tel_number: req.body.tel_number,
            contact_roles: [req.body.contact_type],
            contact_id: req.body.contact_id,
          });
        }
        break;

      case "jobCandidate":
      case "worker":
        contact = new ContactModel.Contact({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          address: req.body.address,
          organization_or_person: req.body.organization_or_person,
          tel_number: req.body.tel_number,
          contact_roles: [req.body.contact_type],
          worker_role: req.body.worker_role,
          seniority: req.body.seniority,
          contact_id: req.body.contact_id,
          hired: req.body.contact_type === "worker " ? true : false,
        });
        break;
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await contact.save();

    const totalCount = await ContactModel.Contact.count();

    await mongoose.connection.close();

    // Respond with a success status
    res.status(201).json({ error: false, count: totalCount });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      // Duplicate key error, email is not unique
      res.status(200).json({ error: "Email must be unique" });
    } else {
      // Handle other errors and respond with a server error status
      console.error("Error saving contact:", error);
      res.status(500).json({ error: "Failed to create contact" });
    }
  }
};

const getContacts = async (req, res) => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const contactType = req.body.contactType || req.query.contactType;
    const page = req.body.page || req.query.page;

    // Fetch contacts using Mongoose
    let contacts;
    let criteria = {};

    if (contactType) {
      criteria["contact_roles"] = { $in: [contactType] };
    }

    if (req.body.filters || req.body.sortables) {
      if (req.body.filters.length > 0) {
        req.body.filters.forEach((filter) => {
          // Use the $regex operator with a regular expression pattern
          criteria[filter.filterName] = {
            $regex: filter.filterValue,
            $options: "i",
          };
        });
      }
      let sortOptions = {};
      if (req.body.sortables.length > 0) {
        req.body.sortables.forEach((filter) => {
          sortOptions[filter.filterName] = filter.ascending ? 1 : -1;
        });
      }
      contacts = await ContactModel.Contact.find(criteria)
        .sort(sortOptions)
        .skip((page - 1) * 25)
        .limit(page * 25);
    } else {
      contacts = contactType
        ? await ContactModel.Contact.find(criteria)
            .skip((page - 1) * 25)
            .limit(page * 25)
        : await ContactModel.Contact.find()
            .skip((page - 1) * 25)
            .limit(page * 25);
    }

    let totalCount = await ContactModel.Contact.count();

    if (contacts.length < 25) {
      totalCount = contacts.length;
    }

    res.status(200).json({ contacts: contacts, count: totalCount });
  } catch (error) {
    console.error("Error connecting or retrieving data:", error);
    res.status(200).json({ error: "Failed to retrieve contacts" });
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
};

const removeContacts = async (req, res) => {
  const contactIds = req.body; // Assuming you receive an array of contact ids in the request body
  try {
    // Delete multiple documents

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await ContactModel.Contact.deleteMany({ contact_id: { $in: contactIds } });
    const totalCount = await ContactModel.Contact.count();
    await mongoose.connection.close();

    return res
      .status(200)
      .json({ error: false, message: "Contacts deleted", count: totalCount });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ error: "Failed to delete the contacts" });
  }
};

const updateContact = async (req, res) => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const contactId = req.body.contact_id; // get the contact_id from the request body

    // Update contact using Mongoose
    const updatedContact = await ContactModel.Contact.findOneAndUpdate(
      { contact_id: contactId },
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({ error: false });
  } catch (error) {
    console.error("Error connecting or updating data:", error);
    res.status(200).json({ error: "Failed to update contact" });
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
};

const changeContactHireStatus = async (req, res) => {
  try {
    if (
      !Array.isArray(req.body.contactIdsToUpdate) ||
      req.body.contactIdsToUpdate.length === 0
    ) {
      return res
        .status(200)
        .json({ error: "Invalid or empty contactIds array" });
    }

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const contactIdsToUpdate = req.body.contactIdsToUpdate;
    const isHired = req.body.isHired;

    // Update contact using Mongoose
    const updateResult = await ContactModel.Contact.updateMany(
      { contact_id: { $in: contactIdsToUpdate } },
      { $set: { hired: isHired } }
    );

    if (updateResult.nModified === 0) {
      return res.status(200).json({ error: "No contacts found to update" });
    }

    res.status(200).json({ error: false });
  } catch (error) {
    console.error("Error connecting or updating data:", error);
    res.status(200).json({ error: "Failed to update contact" });
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
};

const updateSeniorityLevel = async (req, res) => {
  console.log("BONJOUR");
  try {
    if (
      !Array.isArray(req.body.contactIdsToUpdate) ||
      req.body.contactIdsToUpdate.length === 0
    ) {
      return res
        .status(200)
        .json({ error: "Invalid or empty contactIds array" });
    }

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const contactIdsToUpdate = req.body.contactIdsToUpdate;
    const seniorityLevel = req.body.seniorityLevel;

    // Update contact using Mongoose
    const updateResult = await ContactModel.Contact.updateMany(
      { contact_id: { $in: contactIdsToUpdate } },
      {
        $set: {
          seniority: seniorityLevel,
        },
      }
    );

    if (updateResult.nModified === 0) {
      return res.status(200).json({ error: "No contacts found to update" });
    }

    res.status(200).json({ error: false });
  } catch (error) {
    console.error("Error connecting or updating data:", error);
    res.status(200).json({ error: "Failed to update contact" });
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
};

module.exports = {
  createContact,
  getContacts,
  removeContacts,
  updateContact,
  changeContactHireStatus,
  updateSeniorityLevel,
};
