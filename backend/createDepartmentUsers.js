const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');

const createDepartmentUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-city-portal');

    console.log('🔄 Checking for departments without user accounts...');

    // Find all departments
    const departments = await Department.find({});

    for (const dept of departments) {
      // Check if user account already exists
      const existingUser = await User.findOne({ email: dept.email });

      if (!existingUser) {
        console.log(`📝 Creating user account for department: ${dept.name}`);

        // Create user account (password hashing is handled in User model pre-save hook)
        const defaultPassword = 'password123';

        const departmentUser = await User.create({
          name: dept.name,
          email: dept.email,
          phone: dept.phone,
          address: dept.address || 'Department Office',
          password: defaultPassword,
          role: 'department',
          department: dept._id
        });

        // Update department with head reference
        dept.head = departmentUser._id;
        await dept.save();

        console.log(`✅ Created user account: ${departmentUser.email} (password: ${defaultPassword})`);
      } else {
        console.log(`ℹ️ User account already exists for: ${dept.name}`);
      }
    }

    console.log('🎉 Department user creation process completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating department users:', error);
    process.exit(1);
  }
};

createDepartmentUsers();