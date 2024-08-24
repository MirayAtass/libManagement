const { Sequelize } = require('sequelize');
const config = require('./config');

const env = 'development';
const { username, password, database, host, dialect } = config[env];

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
