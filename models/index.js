const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://root:admin@localhost:3306/libmanagementproject');

const User = sequelize.define('User', {
  memberFullName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'members',
  timestamps: false
});

const Book = sequelize.define('Book', {
  bookName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'books',
  timestamps: false
});

const Borrow = sequelize.define('Borrow', {
  borrowDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE
  },
  score: {
    type: DataTypes.INTEGER
  },
  isReturned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'borrows',
  timestamps: false
});

User.hasMany(Borrow, { foreignKey: 'membersId' });
Borrow.belongsTo(User, { foreignKey: 'membersId' });

Book.hasMany(Borrow, { foreignKey: 'bookId' });
Borrow.belongsTo(Book, { foreignKey: 'bookId' });

module.exports = { sequelize, User, Book, Borrow };