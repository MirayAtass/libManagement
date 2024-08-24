const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');
const Book = require('./book');

class Borrow extends Model {}

Borrow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  membersId: {
    type: DataTypes.STRING,
    allowNull: false
  },  
  bookId: {
    type: DataTypes.STRING,
    allowNull: false
  }, 
  borrowDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isReturned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  modelName: 'Borrow',
  tableName: 'borrows',
  timestamps: true
});

Borrow.belongsTo(Member, { foreignKey: 'membersId' });
Borrow.belongsTo(Book, { foreignKey: 'bookId' });

module.exports = Borrow;