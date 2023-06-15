const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).send({ message: "No token provided!" });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

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

module.exports = verifyToken;