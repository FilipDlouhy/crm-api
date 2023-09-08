class UserDto {
  // Constructor for creating a new user instance
  constructor(
    firstName,
    lastName,
    email,
    telNumber,
    roles,
    userId,
    state,
    date
  ) {
    // User's first name
    this.first_name = firstName;

    // User's last name
    this.last_name = lastName;

    // User's email address
    this.email = email;

    // User's telephone number
    this.tel_number = telNumber;

    // User's unique identifier (id)
    this.user_id = userId;

    // Array to store the user's roles
    this.role_ids = roles;

    // Indicator of user's active status (0 deactivated, 1 pending, 2 active)
    this.state = state;

    this.created_at = date;
  }
}

// Export the User class to make it available for other modules
module.exports = UserDto;
