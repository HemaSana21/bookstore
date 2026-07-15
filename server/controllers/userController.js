const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Update own profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, mobile, address } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (mobile) user.mobile = mobile;
    if (address) {
      let parsedAddress = address;
      if (typeof address === 'string') {
        try {
          parsedAddress = JSON.parse(address);
        } catch (err) {
          return res.status(400).json({ success: false, message: 'Invalid address format' });
        }
      }
      user.address = { ...(user.address?.toObject?.() || {}), ...parsedAddress };
    }
    if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order history for current user
// @route   GET /api/users/order-history
exports.getOrderHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// ---------- Admin ----------

// @desc    Get all users (Admin)
// @route   GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend/Activate a user (Admin)
// @route   PUT /api/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${status}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard statistics (Admin)
// @route   GET /api/users/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const Book = require('../models/Book');

    const [totalUsers, totalBooks, totalOrders, orders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Book.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: { $ne: 'Cancelled' } })
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

    const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    // Revenue for last 6 months for charting
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$grandTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        revenue: +revenue.toFixed(2),
        ordersByStatus,
        monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};