const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const userService = require("../services/user.service");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/authMiddleware");

exports.signup = async (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.address || !req.body.phoneNumber || !req.body.age) {
    res.status(400).send({
      message: "Name, email, password, address, phoneNumber, and age are required!",
    });
    return;
  }

  // Fetch a random image from Unsplash
  let imageURL;
  try {
    const accessKey = process.env.API_ACCESS_KEY;
    const response = await axios.get("https://api.unsplash.com/photos/random", {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });
    imageURL = response.data.urls.regular;
    console.log("Random image URL:", imageURL);
  } catch (error) {
    console.log("Error fetching random image:", error);
    imageURL = ""; // Assign a default image URL if there's an error
  }

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    image: imageURL,
    age: req.body.age,
  };

  try {
    await userService.create(userData);
    res.send({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while registering the User.",
    });
  }
};

exports.login = async (req, res) => {
  // Validate request
  if (!req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Email and password are required!",
    });
    return;
  }

  try {
    const user = await userService.findByEmail(req.body.email);
    if (!user) {
      res.status(404).send({ message: "User not found!" });
      return;
    }

    // Check if the password is valid
    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

    if (!passwordIsValid) {
      res.status(401).send({ message: "Invalid password!" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, "your-secret-key", {
      expiresIn: 86400, // 24 hours in seconds
    });

    res.send({ token });
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving User with email: " + req.body.email,
    });
  }
};

exports.create = [verifyToken, async (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.image || !req.body.address || !req.body.age || !req.body.phoneNumber) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    image: req.body.image,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    age: req.body.age,
  };

  try {
    const data = await userService.create(userData);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User.",
    });
  }
}];

exports.findAll = [verifyToken, async (req, res) => {
  try {
    const data = await userService.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users.",
    });
  }
}];

exports.findOne = [verifyToken, async (req, res) => {
  const id = req.params.id;

  try {
    const data = await userService.findById(id);
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find User with id=${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving User with id=" + id,
    });
  }
}];

exports.update = [verifyToken, async (req, res) => {
  const id = req.params.id;

  try {
    const data = await userService.updateById(id, req.body);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: "Error updating User with id=" + id,
    });
  }
}];

exports.delete = [verifyToken, async (req, res) => {
  const id = req.params.id;

  try {
    const data = await userService.deleteById(id);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: "Could not delete User with id=" + id,
    });
  }
}];

exports.deleteAll = [verifyToken, async (req, res) => {
  try {
    const data = await userService.deleteAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all users.",
    });
  }
}];
