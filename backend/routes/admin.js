const express = require('express');
const User = require('../models/User');
const PickupRequest = require('../models/PickupRequest');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await PickupRequest.countDocuments();
    const pendingRequests = await PickupRequest.countDocuments({ status: 'pending' });
    const assignedRequests = await PickupRequest.countDocuments({ status: 'assigned' });
    const collectedRequests = await PickupRequest.countDocuments({ status: 'collected' });

    // Calculate total reward points distributed
    const collectedPickups = await PickupRequest.find({ status: 'collected' });
    const totalRewardPoints = collectedPickups.reduce((sum, pickup) => sum + pickup.rewardPoints, 0);

    // Get recent requests
    const recentRequests = await PickupRequest.find()
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      message: 'Dashboard statistics retrieved successfully',
      statistics: {
        totalUsers,
        totalRequests,
        pendingRequests,
        assignedRequests,
        collectedRequests,
        totalRewardPoints
      },
      recentRequests
    });
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(filter);

    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get user by ID
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's pickup requests
    const pickupRequests = await PickupRequest.find({ user: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'User retrieved successfully',
      user,
      pickupRequests
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// Get analytics data
router.get('/analytics', authenticateAdmin, async (req, res) => {
  try {
    // Monthly request statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await PickupRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRequests: { $sum: 1 },
          collectedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'collected'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Item type statistics
    const itemTypeStats = await PickupRequest.aggregate([
      {
        $group: {
          _id: '$itemType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Status distribution
    const statusStats = await PickupRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top users by reward points
    const topUsers = await User.find()
      .select('name email rewardPoints')
      .sort({ rewardPoints: -1 })
      .limit(10);

    res.json({
      message: 'Analytics data retrieved successfully',
      analytics: {
        monthlyStats,
        itemTypeStats,
        statusStats,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics data' });
  }
});

module.exports = router;
