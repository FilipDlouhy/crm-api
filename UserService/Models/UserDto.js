class User {
  // Constructor for creating a new user instance
  constructor(firstName, lastName, email, telNumber, password, id) {
    // User's first name
    this.firstName = firstName;

    // User's last name
    this.lastName = lastName;

    // User's email address
    this.email = email;

    // User's telephone number
    this.telNumber = telNumber;

    // User's password
    this.password = password;

    // User's unique identifier (id)
    this.userId = id;

    // ID of the contact assigned to the user
    this.assignedContactId = null;

    // Array to store the user's roles
    this.roles = [];

    // Indicator of user's active status (0 deactivated, 1 pending, 2 active)
    this.state = 2;
  }

  // Method to assign a contact to the user
  assignContact(contactId) {
    this.assignedContactId = contactId;
  }

  // Method to add a role to the user's roles array
  addRole(roleId) {
    this.roles.push(roleId);
  }
}

// Export the User class to make it available for other modules
module.exports = User;
3;
