const mongoose = require("mongoose");
const ContactModel = require("../Models/ContactModel");
// Define the MongoDB connection URL
const mongoUrl =
  "mongodb+srv://Alexios:Alexios123456789@cluster0.cduhy9n.mongodb.net/ContactService?retryWrites=true&w=majority";

// Define the function to create a contact
const createContact = async (req, res) => {
  try {
    let contact;

    if (
      req.body.contact_type === "vendor" ||
      req.body.contact_type === "customer"
    ) {
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
    } else if (
      req.body.contact_type === "jobCandidate" ||
      req.body.contact_type === "worker"
    ) {
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
      });
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
    const page = req.body.page || req.query.page;
    console.log(page);
    // Connect to MongoDB
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Fetch contacts using Mongoose
    let contacts;
    if (req.body.filters || req.body.sortables) {
      let criteria = {};

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
      contacts = await ContactModel.Contact.find({})
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
    res.status(500).json({ error: "Failed to retrieve contacts" });
  } finally {
    // Close the MongoDB connection
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

// Export the createContact function for use in other parts of the application
module.exports = {
  createContact,
  getContacts,
  removeContacts,
};
