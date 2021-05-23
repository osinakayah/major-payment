
require('dotenv').config()
module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    port: process.env.DEV_DB_PORT,
    dialect: process.env.DEV_DB_USERNAME_DIALECT,
    dialectOptions: {
      bigNumberStrings: true
    },
    seederStorage: "sequelize",
    logging: false,
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: '127.0.0.1',
    port: process.env.DEV_DB_PORT,
    dialect: process.env.DEV_DB_USERNAME_DIALECT,
    dialectOptions: {
      bigNumberStrings: true
    },
    seederStorage: "sequelize",
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: process.env.DEV_DB_USERNAME_DIALECT,
    seederStorage: "sequelize",
    logging: false,
  }
};
