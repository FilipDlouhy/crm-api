class Role {
  // Constructor for creating a new user instance
  constructor(roleName, rights, roleId) {
    //Name of the role
    this.role_name = roleName;

    //Rights which role has
    this.rights = rights;

    this.role_id = roleId;

    this.created_at = new Date();
  }
}

// Export the User class to make it available for other modules
module.exports = Role;
