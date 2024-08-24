const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const db = require('./db');

//Listing members
app.get('/users', (req, res) => {
    db.query('SELECT * FROM members', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

//Listing member with id
app.get('/users/:id', (req, res) => {
    const memberId = parseInt(req.params.id, 10);
    db.query(`SELECT m.membersId, m.memberFullName, b.bookId, b.borrowDate, b.returnDate, b.score, b.isReturned FROM members m LEFT JOIN borrows b ON m.membersId = b.membersId WHERE m.membersId = ?`, [memberId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const memberInformation = {
            memberId: results[0].membersId,
            memberFullName: results[0].memberFullName,
            borrowedBooks: results.filter(data => data.isReturned == 1).map(data =>({
                bookId: data.bookId,
                borrowedDate: data.borrowDate,
                returnDate: data.returnDate,
                score: data.score
            })),
            currentBorrowingBooks: results.filter(data => data.isReturned == 0)
            .map(data => ({
                bookId: data.bookId,
                borrowDate: data.borrowDate,
            })),
        }
        res.json(memberInformation);
    });
});


//Add new member
app.post('/users', (req, res) => {
    const  memberFullName  = req.body.name;
    db.query('INSERT INTO members (memberFullName) VALUES (?)', [memberFullName], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, memberFullName });
    });
});

//Listing books
app.get('/books', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

//Listing book with id
app.get('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    db.query('SELECT book.bookId, book.bookName, b.score, b.isReturned FROM books book LEFT JOIN borrows b ON book.bookId = b.bookId WHERE book.bookId = ?', [bookId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const { totalScore, count } = results.reduce((total, data) => {
            if (data.isReturned == 1 && data.score != null) {
                total.totalScore += data.score;
                total.count += 1;
            }
            return total;
        }, { totalScore: 0, count: 0 });

        const averageScore = count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0;

        const bookInformation = {
            bookId: results[0].bookId,
            bookName: results[0].bookName,
            averageScore: averageScore
        }
        res.json(bookInformation);
    });
});

//Add new book
app.post('/books', (req, res) => {
    const  bookName  = req.body.name;
    db.query('INSERT INTO books (bookName) VALUES (?)', [bookName], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, bookName });
    });
});

//Borrow a book
app.post('/users/:membersId/borrow/:bookId', (req, res) => {
    const membersId = parseInt(req.params.membersId, 10);
    const bookId = parseInt(req.params.bookId, 10);
    const borrowDate = new Date();
    const returnDate = null;
    db.query('INSERT INTO borrows (membersId, bookId, borrowDate, returnDate) VALUES (?, ?, ?, ?)', [membersId, bookId, borrowDate, returnDate], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, membersId, bookId, borrowDate, returnDate });
    });
});


//Return a book
app.post('/users/:membersId/return/:bookId', (req, res) => {
    const membersId = parseInt(req.params.membersId, 10);
    const bookId = parseInt(req.params.bookId, 10);
    const score = req.body.score;
    
    const returnDate = new Date();
    db.query('UPDATE borrows SET returnDate = ?, score = ?, isReturned = 1 WHERE membersId = ? AND bookId = ?', [returnDate, score, membersId, bookId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, membersId, bookId, returnDate });
    });
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});