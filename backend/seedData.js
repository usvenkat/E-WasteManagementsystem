const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
const PickupRequest = require('./models/PickupRequest');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await PickupRequest.deleteMany({});
    console.log('Cleared existing data');

    // Create sample admin
    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@ewaste.com',
      password: 'admin123'
    });
    await admin.save();
    console.log('Created admin: admin@ewaste.com / admin123');

    // Create sample users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'user123',
        phone: '+1234567890',
        address: '123 Main St, City, State 12345'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'user123',
        phone: '+0987654321',
        address: '456 Oak Ave, Town, State 67890'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'user123',
        phone: '+1122334455',
        address: '789 Pine Rd, Village, State 13579'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Create sample pickup requests
    const pickupRequests = [
      {
        user: createdUsers[0]._id,
        itemType: 'laptop',
        quantity: 2,
        condition: 'working',
        pickupAddress: '123 Main St, City, State 12345',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'pending',
        notes: 'Old laptops from office upgrade'
      },
      {
        user: createdUsers[0]._id,
        itemType: 'mobile',
        quantity: 3,
        condition: 'not_working',
        pickupAddress: '123 Main St, City, State 12345',
        preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'assigned',
        assignedTo: admin._id,
        notes: 'Broken phones, screens damaged'
      },
      {
        user: createdUsers[1]._id,
        itemType: 'desktop',
        quantity: 1,
        condition: 'partially_working',
        pickupAddress: '456 Oak Ave, Town, State 67890',
        preferredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'collected',
        assignedTo: admin._id,
        collectedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'Desktop computer with faulty power supply'
      },
      {
        user: createdUsers[1]._id,
        itemType: 'printer',
        quantity: 2,
        condition: 'working',
        pickupAddress: '456 Oak Ave, Town, State 67890',
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'pending',
        notes: 'Office printers, still functional'
      },
      {
        user: createdUsers[2]._id,
        itemType: 'monitor',
        quantity: 1,
        condition: 'working',
        pickupAddress: '789 Pine Rd, Village, State 13579',
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'pending',
        notes: '24 inch LCD monitor'
      },
      {
        user: createdUsers[2]._id,
        itemType: 'keyboard',
        quantity: 5,
        condition: 'working',
        pickupAddress: '789 Pine Rd, Village, State 13579',
        preferredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'collected',
        assignedTo: admin._id,
        collectedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        notes: 'Bulk keyboards from office cleanup'
      }
    ];

    for (const requestData of pickupRequests) {
      const pickup = new PickupRequest(requestData);
      await pickup.save();
    }
    console.log(`Created ${pickupRequests.length} pickup requests`);

    // Update user reward points for collected requests
    const collectedRequests = await PickupRequest.find({ status: 'collected' });
    for (const request of collectedRequests) {
      await User.findByIdAndUpdate(request.user, {
        $inc: { rewardPoints: request.rewardPoints }
      });
    }

    console.log('Seed data completed successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@ewaste.com / admin123');
    console.log('User 1: john@example.com / user123');
    console.log('User 2: jane@example.com / user123');
    console.log('User 3: bob@example.com / user123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
