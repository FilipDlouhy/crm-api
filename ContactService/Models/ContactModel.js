const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  organization_name: String,
  email: {
    type: String,
    unique: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  address: String,
  organization_or_person: String,
  activities: [String],
  contracts: [String],
  tel_number: String,
  contact_roles: [String],
  worker_role: String,
  seniority: String,
  contact_id: String,
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = {
  Contact,
};
