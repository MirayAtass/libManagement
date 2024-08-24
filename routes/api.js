const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../models');

router.get('/users', async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', [
  param('id').isInt().withMessage('Member ID must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const memberId = parseInt(req.params.id, 10);
    const member = await db.User.findByPk(memberId, {
      include: [{
        model: db.Borrow,
        include: [db.Book]
      }]
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const borrowedBooks = member.Borrows.filter(borrow => borrow.isReturned)
      .map(borrow => ({
        bookId: borrow.Book.id,
        bookName: borrow.Book.bookName,
        borrowedDate: borrow.borrowDate,
        returnDate: borrow.returnDate,
        score: borrow.score
      }));

    const currentBorrowingBooks = member.Borrows.filter(borrow => !borrow.isReturned)
      .map(borrow => ({
        bookId: borrow.Book.id,
        bookName: borrow.Book.bookName,
        borrowDate: borrow.borrowDate
      }));

    res.json({
      memberId: member.id,
      memberFullName: member.memberFullName,
      borrowedBooks,
      currentBorrowingBooks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', [
  body('name').isString().withMessage('Member name must be a string').notEmpty().withMessage('Member name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const memberFullName = req.body.name;
    const user = await db.User.create({ memberFullName });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/books', async (req, res) => {
  try {
    const books = await db.Book.findAll();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/books/:id', [
  param('id').isInt().withMessage('Book ID must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const bookId = parseInt(req.params.id, 10);
    const book = await db.Book.findByPk(bookId, {
      include: {
        model: db.Borrow,
        attributes: ['score', 'isReturned']
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const returnedBorrows = book.Borrows.filter(borrow => borrow.isReturned);

    const totalScore = returnedBorrows.reduce((total, borrow) => total + borrow.score, 0);
    const count = returnedBorrows.length;
    const averageScore = count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0;

    res.json({
      bookId: book.id,
      bookName: book.bookName,
      averageScore
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books', [
  body('name').isString().withMessage('Book name must be a string').notEmpty().withMessage('Book name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const bookName = req.body.name;
    const book = await db.Book.create({ bookName });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:membersId/borrow/:bookId', [
  param('membersId').isInt().withMessage('Member ID must be an integer'),
  param('bookId').isInt().withMessage('Book ID must be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const membersId = parseInt(req.params.membersId, 10);
    const bookId = parseInt(req.params.bookId, 10);
    const borrowDate = new Date();

    const user = await db.User.findByPk(membersId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const book = await db.Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const borrowedBooksCount = await db.Borrow.count({
      where: {
        membersId,
        returnDate: null
      }
    });

    if (borrowedBooksCount >= 3) {
      return res.status(400).json({ error: 'User cannot borrow more than 3 books at a time' });
    }

    const anotherMember = await db.Borrow.findOne({
      where: {
        bookId,
        returnDate: null
      }
    });

    if (anotherMember) {
      return res.status(400).json({ error: 'This book is already borrowed by another member' });
    }

    const existingBorrow = await db.Borrow.findOne({
      where: {
        membersId,
        bookId,
        returnDate: null
      }
    });

    if (existingBorrow) {
      return res.status(400).json({ error: 'This book is already borrowed' });
    }

    const borrow = await db.Borrow.create({
      membersId,
      bookId,
      borrowDate,
      returnDate: null
    });

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:membersId/return/:bookId', [
  param('membersId').isInt().withMessage('Member ID must be an integer'),
  param('bookId').isInt().withMessage('Book ID must be an integer'),
  body('score').optional().isFloat({ min: 0 }).withMessage('Score must be a non-negative number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const membersId = parseInt(req.params.membersId, 10);
    const bookId = parseInt(req.params.bookId, 10);
    const { score } = req.body;
    const returnDate = new Date();

    const [affectedRows] = await db.Borrow.update({
      returnDate,
      score,
      isReturned: true
    }, {
      where: { membersId, bookId }
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }

    res.status(200).json({ membersId, bookId, returnDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
