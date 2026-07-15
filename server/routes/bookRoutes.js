const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, adminOnly, upload.single('coverImage'), createBook);
router.put('/:id', protect, adminOnly, upload.single('coverImage'), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
