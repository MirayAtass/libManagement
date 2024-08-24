require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'libmanagementproject',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  }
};