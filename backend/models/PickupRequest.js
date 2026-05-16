const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    required: [true, 'Item type is required'],
    enum: ['laptop', 'desktop', 'mobile', 'tablet', 'printer', 'monitor', 'keyboard', 'mouse', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['working', 'not_working', 'partially_working']
  },
  pickupAddress: {
    type: String,
    required: [true, 'Pickup address is required'],
    trim: true
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'collected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  collectedDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
pickupRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
