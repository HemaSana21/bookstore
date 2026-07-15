const express = require('express');
const router = express.Router();
const {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
