require('dotenv').config();

const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.dialect,
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};


db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);

module.exports = db;