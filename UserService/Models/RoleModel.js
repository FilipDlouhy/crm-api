// Define a JavaScript class called "Role"
class Role {
  // Constructor for creating a new role instance
  constructor(roleName, rights, roleId) {
    // Name of the role
    this.role_name = roleName;

    // Rights which the role has
    this.rights = rights;

    // Unique identifier for the role
    this.role_id = roleId;

    // Timestamp representing the creation date and time of the role
    this.created_at = new Date();
  }
}

// Export the Role class to make it available for other modules
module.exports = Role;
