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
    db.query('SELECT * FROM members WHERE membersId = ?', [memberId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
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
    db.query('SELECT * FROM books WHERE bookId = ?', [bookId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});