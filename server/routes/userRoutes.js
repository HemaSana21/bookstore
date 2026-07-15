const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getOrderHistory,
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getDashboardStats
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.put('/profile', upload.single('profilePicture'), updateProfile);
router.get('/order-history', getOrderHistory);

// Admin
router.get('/admin/stats', adminOnly, getDashboardStats);
router.get('/', adminOnly, getAllUsers);
router.delete('/:id', adminOnly, deleteUser);
router.put('/:id/status', adminOnly, updateUserStatus);

module.exports = router;
