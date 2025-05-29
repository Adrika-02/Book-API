const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataPath = path.join(__dirname, 'books.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
function readBooks() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeBooks(books) {
  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Book API!');
});

app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});

app.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  const books = readBooks();
  const newBook = {
    id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
    title,
    author
  };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const { title, author } = req.body;

  let books = readBooks();
  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  books[index] = { id: bookId, title, author };
  writeBooks(books);
  res.json(books[index]);
});

app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  let books = readBooks();

  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const deleted = books.splice(index, 1)[0];
  writeBooks(books);
  res.json(deleted);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
