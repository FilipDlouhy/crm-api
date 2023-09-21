const mongoose = require("mongoose");

class Contact {
  constructor(
    first_name,
    last_name,
    organization_name,
    created_at,
    contact_type,
    address,
    contact_email,
    organization_or_person,
    activities = [],
    contracts = [],
    contact_roles = []
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.organization_name = organization_name;
    this.created_at = created_at;
    this.contact_type = contact_type;
    this.address = address;
    this.contact_email = contact_email;
    this.organization_or_person = organization_or_person;
    this.activities = activities;
    this.contracts = contracts;
    this.contact_roles = contact_roles;
  }

  // Static method to generate a Mongoose schema
  static generateSchema() {
    return new mongoose.Schema({
      first_name: String,
      last_name: String,
      organization_name: String,
      created_at: Date,
      contact_type: String,
      address: String,
      contact_email: String,
      organization_or_person: String,
      activities: [String],
      contracts: [String],
      contact_roles: [String],
    });
  }
}

const ContactSchema = Contact.generateSchema();
const ContactModel = mongoose.model("Contact", ContactSchema);

module.exports = {
  Contact,
  ContactModel,
};
