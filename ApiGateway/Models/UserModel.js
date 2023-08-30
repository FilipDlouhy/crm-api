class User {
  constructor(firstName, lastName, email, telNumber, password, id) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.telNumber = telNumber;
    this.password = password;
    this.userId = id;
    this.assignedContactId = null;
    this.roles = [];
  }
  assignContact(contactId) {
    this.assignedContactId = contactId;
  }

  addRole(roleId) {
    this.roles.push(roleId);
  }
}

module.exports = User;
