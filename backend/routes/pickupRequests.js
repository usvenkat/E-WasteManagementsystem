const express = require('express');
const { body, validationResult } = require('express-validator');
const PickupRequest = require('../models/PickupRequest');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a new pickup request (User only)
router.post('/', authenticateUser, [
  body('itemType').isIn(['laptop', 'desktop', 'mobile', 'tablet', 'printer', 'monitor', 'keyboard', 'mouse', 'other']).withMessage('Valid item type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('condition').isIn(['working', 'not_working', 'partially_working']).withMessage('Valid condition is required'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('preferredDate').isISO8601().withMessage('Valid preferred date is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemType, quantity, condition, pickupAddress, preferredDate, notes } = req.body;

    // Calculate reward points based on item type and quantity
    const pointsPerItem = {
      'laptop': 50,
      'desktop': 40,
      'mobile': 20,
      'tablet': 25,
      'printer': 30,
      'monitor': 35,
      'keyboard': 10,
      'mouse': 5,
      'other': 15
    };

    const rewardPoints = pointsPerItem[itemType] * quantity;

    const pickupRequest = new PickupRequest({
      user: req.user._id,
      itemType,
      quantity,
      condition,
      pickupAddress,
      preferredDate: new Date(preferredDate),
      notes,
      rewardPoints
    });

    await pickupRequest.save();
    await pickupRequest.populate('user', 'name email phone');

    res.status(201).json({
      message: 'Pickup request created successfully',
      pickupRequest
    });
  } catch (error) {
    console.error('Create pickup request error:', error);
    res.status(500).json({ message: 'Server error while creating pickup request' });
  }
});

// Get all pickup requests for the logged-in user
router.get('/my-requests', authenticateUser, async (req, res) => {
  try {
    const pickupRequests = await PickupRequest.find({ user: req.user._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'User pickup requests retrieved successfully',
      pickupRequests
    });
  } catch (error) {
    console.error('Get user pickup requests error:', error);
    res.status(500).json({ message: 'Server error while fetching pickup requests' });
  }
});

// Get a specific pickup request by ID (User only - can only see their own requests)
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('assignedTo', 'name email');

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    res.json({
      message: 'Pickup request retrieved successfully',
      pickupRequest
    });
  } catch (error) {
    console.error('Get pickup request error:', error);
    res.status(500).json({ message: 'Server error while fetching pickup request' });
  }
});

// Update a pickup request (User only - can only update their own pending requests)
router.put('/:id', authenticateUser, [
  body('itemType').optional().isIn(['laptop', 'desktop', 'mobile', 'tablet', 'printer', 'monitor', 'keyboard', 'mouse', 'other']).withMessage('Valid item type is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('condition').optional().isIn(['working', 'not_working', 'partially_working']).withMessage('Valid condition is required'),
  body('pickupAddress').optional().trim().notEmpty().withMessage('Pickup address cannot be empty'),
  body('preferredDate').optional().isISO8601().withMessage('Valid preferred date is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pickupRequest = await PickupRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending'
    });

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found or cannot be updated' });
    }

    const { itemType, quantity, condition, pickupAddress, preferredDate, notes } = req.body;

    // Update fields
    if (itemType) pickupRequest.itemType = itemType;
    if (quantity) pickupRequest.quantity = quantity;
    if (condition) pickupRequest.condition = condition;
    if (pickupAddress) pickupRequest.pickupAddress = pickupAddress;
    if (preferredDate) pickupRequest.preferredDate = new Date(preferredDate);
    if (notes !== undefined) pickupRequest.notes = notes;

    // Recalculate reward points if item type or quantity changed
    if (itemType || quantity) {
      const pointsPerItem = {
        'laptop': 50,
        'desktop': 40,
        'mobile': 20,
        'tablet': 25,
        'printer': 30,
        'monitor': 35,
        'keyboard': 10,
        'mouse': 5,
        'other': 15
      };

      pickupRequest.rewardPoints = pointsPerItem[pickupRequest.itemType] * pickupRequest.quantity;
    }

    await pickupRequest.save();
    await pickupRequest.populate('assignedTo', 'name email');

    res.json({
      message: 'Pickup request updated successfully',
      pickupRequest
    });
  } catch (error) {
    console.error('Update pickup request error:', error);
    res.status(500).json({ message: 'Server error while updating pickup request' });
  }
});

// Delete a pickup request (User only - can only delete their own pending requests)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending'
    });

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found or cannot be deleted' });
    }

    res.json({
      message: 'Pickup request deleted successfully'
    });
  } catch (error) {
    console.error('Delete pickup request error:', error);
    res.status(500).json({ message: 'Server error while deleting pickup request' });
  }
});

// Get all pickup requests (Admin only)
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const pickupRequests = await PickupRequest.find(filter)
      .populate('user', 'name email phone address')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'All pickup requests retrieved successfully',
      pickupRequests
    });
  } catch (error) {
    console.error('Get all pickup requests error:', error);
    res.status(500).json({ message: 'Server error while fetching pickup requests' });
  }
});

// Assign pickup request to admin (Admin only)
router.put('/:id/assign', authenticateAdmin, async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findById(req.params.id);

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickupRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only assign pending requests' });
    }

    pickupRequest.assignedTo = req.admin._id;
    pickupRequest.status = 'assigned';
    await pickupRequest.save();
    await pickupRequest.populate('user', 'name email phone address');
    await pickupRequest.populate('assignedTo', 'name email');

    res.json({
      message: 'Pickup request assigned successfully',
      pickupRequest
    });
  } catch (error) {
    console.error('Assign pickup request error:', error);
    res.status(500).json({ message: 'Server error while assigning pickup request' });
  }
});

// Mark pickup request as collected (Admin only)
router.put('/:id/collect', authenticateAdmin, async (req, res) => {
  try {
    const pickupRequest = await PickupRequest.findById(req.params.id);

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickupRequest.status !== 'assigned') {
      return res.status(400).json({ message: 'Can only mark assigned requests as collected' });
    }

    pickupRequest.status = 'collected';
    pickupRequest.collectedDate = new Date();
    await pickupRequest.save();

    // Add reward points to user
    const User = require('../models/User');
    await User.findByIdAndUpdate(pickupRequest.user, {
      $inc: { rewardPoints: pickupRequest.rewardPoints }
    });

    await pickupRequest.populate('user', 'name email phone address');
    await pickupRequest.populate('assignedTo', 'name email');

    res.json({
      message: 'Pickup request marked as collected successfully',
      pickupRequest
    });
  } catch (error) {
    console.error('Collect pickup request error:', error);
    res.status(500).json({ message: 'Server error while marking pickup request as collected' });
  }
});

module.exports = router;
