const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Book extends Model {}

Book.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  bookName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Book',
  tableName: 'books',
  timestamps: true
});

module.exports = Book;