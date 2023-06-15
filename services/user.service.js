const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");

// Create and Save a new User
exports.create = async (userData) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 8);

    // Create a User
    const user = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      image: userData.image,
      age: userData.age,
    };

    console.log("ALSO WORKING");
    // Save User in the database
    return await User.create(user);
  } catch (err) {
    throw new Error("Some error occurred while creating the User.");
  }
};

exports.findByEmail = async (email) => {
  console.log("Searching for user with email:", email);
  try {
    return await User.findOne({ where: { email: email } });
  } catch (err) {
    console.log(err);
    throw new Error("Error retrieving User with email: " + email);
  }
};

// Find a single User by id
exports.findById = async (id) => {
  try {
    return await User.findByPk(id);
  } catch (err) {
    throw new Error("Error retrieving User with id=" + id);
  }
};

// Update a User by the id
exports.updateById = async (id, userData) => {
  try {
    const [num] = await User.update(userData, { where: { id: id } });
    if (num === 1) {
      return { message: "User was updated successfully." };
    } else {
      throw new Error(`Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`);
    }
  } catch (err) {
    throw new Error("Error updating User with id=" + id);
  }
};

// Delete a User with the specified id
exports.deleteById = async (id) => {
  try {
    const num = await User.destroy({ where: { id: id } });
    if (num === 1) {
      return { message: "User was deleted successfully!" };
    } else {
      throw new Error(`Cannot delete User with id=${id}. Maybe User was not found!`);
    }
  } catch (err) {
    throw new Error("Could not delete User with id=" + id);
  }
};

// Retrieve all Users
exports.findAll = async () => {
  try {
    return await User.findAll({ where: {} });
  } catch (err) {
    throw new Error("Some error occurred while retrieving users.");
  }
};

// Delete all Users
exports.deleteAll = async () => {
  try {
    const nums = await User.destroy({ where: {}, truncate: false });
    return { message: `${nums} Users were deleted successfully!` };
  } catch (err) {
    throw new Error("Some error occurred while removing all users.");
  }
};
