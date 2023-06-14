const db = require("../models");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require('axios');
require('dotenv').config();

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.userId = decoded.id;
    next();
  });
};

exports.signup = async (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.address || !req.body.phoneNumber || !req.body.age) {
    res.status(400).send({
      message: "Name, email, password, address, phoneNumber, and age are required!"
    });
    return;
  }

  // Fetch a random image from Unsplash
  let imageURL;
  try {
    const accessKey = process.env.API_ACCESS_KEY;
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });
    imageURL = response.data.urls.regular;
    console.log('Random image URL:', imageURL);
  } catch (error) {
    console.log('Error fetching random image:', error);
    imageURL = ''; // Assign a default image URL if there's an error
  }

  // Create a User
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8), // Hash the password
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    image: imageURL, // Use the fetched image URL
    age: req.body.age
  };

  // Save User in the database
  User.create(user)
    .then(data => {
      res.send({ message: "User registered successfully!" });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while registering the User."
      });
    });
};

// Login: Find a User by email and validate password
exports.login = (req, res) => {
  // Validate request
  if (!req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Email and password are required!"
    });
    return;
  }

  // Find the User by email
  User.findOne({ where: { email: req.body.email } })
    .then(user => {
      if (!user) {
        res.status(404).send({ message: "User not found!" });
        return;
      }

      // Check if the password is valid
      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        res.status(401).send({ message: "Invalid password!" });
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, "your-secret-key", {
        expiresIn: 86400 // 24 hours in seconds
      });

      res.send({ token });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with email: " + req.body.email
      });
    });
};

// Create and Save a new User
exports.create = [verifyToken, (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.image || !req.body.address || !req.body.age || !req.body.phoneNumber) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a User
  const user = {
    name: req.body.name,
    email: req.body.email,
    image: req.body.image,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    age: req.body.age
  };

  // Save User in the database
  User.create(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
}];

// Retrieve all Users from the database.
exports.findAll = [verifyToken, (req, res) => {
  User.findAll({ where: {} })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
}];

// Find a single User with an id
exports.findOne = [verifyToken, (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
  
}];

// Update a User by the id in the request
exports.update = [verifyToken, (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
}];

// Delete a User with the specified id in the request
exports.delete = [verifyToken, (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
}];

// Delete all Users from the database.
exports.deleteAll = [verifyToken, (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all users."
      });
    });
}];
