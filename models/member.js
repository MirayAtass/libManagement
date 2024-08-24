const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Member extends Model {}

Member.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  memberFullName: {
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
  modelName: 'Member',
  tableName: 'members',
  timestamps: true
});

module.exports = Member;