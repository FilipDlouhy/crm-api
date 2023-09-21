const mongoose = require("mongoose");
const contactModel = require("../Models/ContactModel");

const mongoUrl =
  "mongodb+srv://chad:9F7t13uR@cluster0.cduhy9n.mongodb.net/ContactService?retryWrites=true&w=majority";

const createContact = async (req, res) => {
  try {
    let contact;
    if (req.body.personOrOrganization === "person") {
      contact = new contactModel.Contact(
        req.body.firstName,
        req.body.lastName,
        null,
        new Date(),
        req.body.contactType,
        req.body.adress,
        null,
        req.body.personOrOrganization,
        [],
        [],
        []
      );
    } else if (req.body.personOrOrganization === "organization") {
      contact = new contactModel.Contact(
        null,
        null,
        req.body.organizationName,
        new Date(),
        req.body.contactType,
        req.body.adress,
        req.body.contactEmail,
        req.body.personOrOrganization,
        [],
        [],
        []
      );
    }

    res.send("Ave Caesar");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createContact,
};

/*

 await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB Atlas!');

    // Define a schema
    const Schema = mongoose.Schema;

    const dataSchema = new Schema({
      name: String,
      id: String,
    });

    // Compile model from schema
    const DataModel = mongoose.model('contacts', dataSchema);

    // Create a new instance of the DataModel
    const newData = new DataModel({
      name: 'KOKOT',
      id: 'KUNDA',
    });

    // Save the new data instance
    await newData.save();

    console.log('Data saved successfully!');

    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Connection closed.');

*/
