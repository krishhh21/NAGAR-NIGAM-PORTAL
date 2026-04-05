const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');

// @desc    Get all departments with stats
// @route   GET /api/admin/departments
// @access  Private/Admin
const getDepartments = async (req, res) => {
  try {
    console.log('Fetching departments...');
    
    // Get all departments
    const departments = await Department.find({})
      .populate('head', 'name email phone')
      .populate('assignedStaff', 'name email role')
      .lean    ();
    
    // Enrich each department with statistics
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        try {
          // Count staff in this department
          const staffCount = await User.countDocuments({ 
            department: dept._id,
            role: 'department' 
          });
          
          // Count complaints assigned to this department
          const totalComplaints = await Complaint.countDocuments({
            department: dept._id
          });
          
          // Count resolved complaints
          const resolvedComplaints = await Complaint.countDocuments({
            department: dept._id,
            status: 'Resolved'
          });
          
          // Count pending complaints
          const pendingComplaints = await Complaint.countDocuments({
            department: dept._id,
            status: 'Pending'
          });
          
          // Count in-progress complaints
          const inProgressComplaints = await Complaint.countDocuments({
            department: dept._id,
            status: 'In Progress'
          });
          
          // Calculate resolution rate
          const resolutionRate = totalComplaints > 0 ? 
            Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
          
          return {
            ...dept,
            staffCount,
            totalComplaints,
            resolvedComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolutionRate
          };
        } catch (error) {
          console.error(`Error getting stats for department ${dept._id}:`, error);
          return {
            ...dept,
            staffCount: 0,
            totalComplaints: 0,
            resolvedComplaints: 0,
            pendingComplaints: 0,
            inProgressComplaints: 0,
            resolutionRate: 0
          };
        }
      })
    );
    
    console.log(`✅ Found ${departmentsWithStats.length} departments`);
    res.json(departmentsWithStats);
  } catch (error) {
    console.error('❌ Error in getDepartments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create user accounts for existing departments
// @route   POST /api/admin/departments/create-users
// @access  Private/Admin
const createDepartmentUsers = async (req, res) => {
  try {
    console.log('Creating user accounts for existing departments...');

    // Find all departments
    const departments = await Department.find({});
    const results = [];

    for (const dept of departments) {
      // Check if user account already exists
      const existingUser = await User.findOne({ email: dept.email });

      if (!existingUser) {
        console.log(`📝 Creating user account for department: ${dept.name}`);

        // Create user account (password hashing handled in User model pre-save hook)
        const defaultPassword = 'password123'; // Default password for department accounts

        const departmentUser = await User.create({
          name: dept.name,
          email: dept.email.toLowerCase(),
          phone: dept.phone,
          address: dept.address || 'Department Office',
          password: defaultPassword,
          role: 'department',
          department: dept._id
        });

        // Update department with head reference
        dept.head = departmentUser._id;
        await dept.save();

        results.push({
          department: dept.name,
          email: departmentUser.email,
          password: defaultPassword,
          status: 'created'
        });

        console.log(`✅ Created user account: ${departmentUser.email}`);
      } else {
        results.push({
          department: dept.name,
          email: dept.email,
          status: 'already_exists'
        });
        console.log(`ℹ️ User account already exists for: ${dept.name}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Department user creation process completed',
      results
    });

  } catch (error) {
    console.error('❌ Error creating department users:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department users',
      error: error.message
    });
  }
};
const createDepartment = async (req, res) => {
  try {
    console.log('Creating department request:', req.body);
    
    const { name, description, email, phone, address, categories } = req.body;

    // Remove address from required validation
    if (!name || !description || !email || !phone) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, description, email, phone' 
      });
    }

    // Check for empty strings after trimming
    const trimmedName = name?.trim();
    const trimmedDescription = description?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedAddress = address?.trim() || ''; // Default to empty string if not provided

    if (!trimmedName || !trimmedDescription || !trimmedEmail || !trimmedPhone) {
      return res.status(400).json({ 
        message: 'Required fields cannot be empty or contain only whitespace' 
      });
    }

    // Check if department already exists
    const existingDepartment = await Department.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } },
        { email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') } }
      ]
    });
    
    if (existingDepartment) {
      const conflictField = existingDepartment.name.toLowerCase() === trimmedName.toLowerCase() 
        ? 'name' 
        : 'email';
      return res.status(400).json({ 
        message: `Department ${conflictField} already exists`
      });
    }

    // Create new department
    const department = await Department.create({
      name: trimmedName,
      description: trimmedDescription,
      email: trimmedEmail.toLowerCase(),
      phone: trimmedPhone,
      address: trimmedAddress, // This will be empty string if not provided
      categories: Array.isArray(categories) ? categories : []
    });

    // Create a user account for the department
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'password123'; // Default password for department accounts
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const departmentUser = await User.create({
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      phone: trimmedPhone,
      address: trimmedAddress || 'Department Office',
      password: hashedPassword,
      role: 'department',
      department: department._id
    });

    // Update department with head reference
    department.head = departmentUser._id;
    await department.save();

    console.log(`✅ Department created: ${department.name} (${department._id})`);
    console.log(`✅ Department user created: ${departmentUser.email} (password: ${defaultPassword})`);
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
      departmentUser: {
        email: departmentUser.email,
        password: defaultPassword,
        role: departmentUser.role
      }
    });
  } catch (error) {
    console.error('❌ Error in createDepartment:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `Department ${field} already exists`,
        field: field
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update a department
// @route   PUT /api/admin/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const updates = req.body;
    
    console.log(`Updating department ${departmentId}:`, updates);

    // Find department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ 
        message: 'Department not found' 
      });
    }

    // Check for unique constraints if name/email is being updated
    if (updates.name && updates.name !== department.name) {
      const nameExists = await Department.findOne({ 
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        _id: { $ne: departmentId }
      });
      if (nameExists) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }
    
    if (updates.email && updates.email !== department.email) {
      const emailExists = await Department.findOne({ 
        email: { $regex: new RegExp(`^${updates.email}$`, 'i') },
        _id: { $ne: departmentId }
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Department email already exists' });
      }
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key === 'email' && updates[key]) {
        department[key] = updates[key].toLowerCase().trim();
      } else if (updates[key] !== undefined) {
        department[key] = updates[key];
      }
    });

    // Save updated department
    await department.save();
    
    console.log(`✅ Department updated: ${department.name}`);
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('❌ Error in updateDepartment:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `Department ${field} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a department
// @route   DELETE /api/admin/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    
    console.log(`Deleting department ${departmentId}`);

    // Find department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ 
        message: 'Department not found' 
      });
    }

    // Check if department has staff assigned
    const hasStaff = await User.exists({ 
      department: departmentId,
      role: 'department' 
    });
    
    if (hasStaff) {
      return res.status(400).json({ 
        message: 'Cannot delete department with assigned staff. Reassign staff first.' 
      });
    }

    // Check if department has active complaints
    const hasActiveComplaints = await Complaint.exists({ 
      department: departmentId,
      status: { $in: ['Pending', 'In Progress'] }
    });
    
    if (hasActiveComplaints) {
      return res.status(400).json({ 
        message: 'Cannot delete department with active complaints. Resolve or reassign complaints first.' 
      });
    }

    // Delete department
    await department.deleteOne();
    
    console.log(`✅ Department deleted: ${department.name}`);
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteDepartment:', error);
    res.status(500).json({ 
      message: 'Failed to delete department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Assign staff to department
// @route   POST /api/admin/departments/:id/assign-staff
// @access  Private/Admin
const assignStaffToDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { userId, role } = req.body;
    
    console.log(`Assigning staff ${userId} to department ${departmentId}`);

    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        message: 'Please provide user ID' 
      });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ 
        message: 'Department not found' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Update user
    user.department = departmentId;
    if (role) {
      user.role = role; // Could be 'department' or 'head'
    }
    
    await user.save();
    
    // Add user to assignedStaff array if not already there
    if (!department.assignedStaff.includes(userId)) {
      department.assignedStaff.push(userId);
    }
    
    // If role is 'head', update department head
    if (role === 'head') {
      department.head = userId;
    }
    
    await department.save();
    
    console.log(`✅ Staff ${user.name} assigned to department ${department.name}`);
    
    res.json({
      success: true,
      message: 'Staff assigned successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: department._id
      },
      department: {
        _id: department._id,
        name: department.name,
        head: role === 'head' ? user._id : department.head,
        assignedStaff: department.assignedStaff
      }
    });
  } catch (error) {
    console.error('❌ Error in assignStaffToDepartment:', error);
    res.status(500).json({ 
      message: 'Failed to assign staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
  try {
    console.log('Fetching system analytics...');
    
    // Get analytics data in parallel for better performance
    const [
      usersByRole,
      totalDepartments,
      totalComplaints,
      recentResolved,
      resolutionStats,
      topDepartments,
      monthlyTrend,
      categoryDistribution
    ] = await Promise.all([
      // 1. Users by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      // 2. Total departments
      Department.countDocuments({ isActive: true }),
      
      // 3. Total complaints
      Complaint.countDocuments(),
      
      // 4. Complaints resolved in last 30 days
      Complaint.countDocuments({
        status: 'Resolved',
        'resolutionDetails.resolvedAt': { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        }
      }),
      
      // 5. Resolution time statistics
      Complaint.aggregate([
        { $match: { status: 'Resolved', 'resolutionDetails.resolvedAt': { $exists: true } } },
        {
          $group: {
            _id: null,
            avgTime: { 
              $avg: { 
                $divide: [
                  { $subtract: ['$resolutionDetails.resolvedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              }
            },
            minTime: {
              $min: {
                $divide: [
                  { $subtract: ['$resolutionDetails.resolvedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24
                ]
              }
            },
            maxTime: {
              $max: {
                $divide: [
                  { $subtract: ['$resolutionDetails.resolvedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        }
      ]),
      
      // 6. Top performing departments (by resolution rate)
      Department.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'complaints',
            localField: '_id',
            foreignField: 'department',
            as: 'complaints'
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalComplaints: { $size: '$complaints' },
            resolvedComplaints: {
              $size: {
                $filter: {
                  input: '$complaints',
                  as: 'complaint',
                  cond: { $eq: ['$$complaint.status', 'Resolved'] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            resolutionRate: {
              $cond: [
                { $eq: ['$totalComplaints', 0] },
                0,
                { $multiply: [{ $divide: ['$resolvedComplaints', '$totalComplaints'] }, 100] }
              ]
            }
          }
        },
        { $sort: { resolutionRate: -1 } },
        { $limit: 5 }
      ]),
      
      // 7. Monthly complaint trend (last 6 months)
      Complaint.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            complaints: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]),
      
      // 8. Complaints by category
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Format monthly trend data
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      complaints: item.complaints,
      resolved: item.resolved,
      pending: item.pending
    }));

    console.log('✅ Analytics data fetched successfully');
    
    res.json({
      usersByRole,
      totalDepartments,
      totalComplaints,
      recentResolved,
      resolutionStats: resolutionStats[0] || { avgTime: 0, minTime: 0, maxTime: 0 },
      topDepartments,
      monthlyTrend: formattedMonthlyTrend,
      categoryDistribution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in getSystemAnalytics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch system analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user status (active/inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;
    
    console.log(`Updating user ${userId} status to: ${isActive}`);

    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: 'Please provide a valid isActive boolean value' 
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    console.log(`✅ User ${user.email} status updated to ${isActive}`);
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Error in updateUserStatus:', error);
    res.status(500).json({ 
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all users (for admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    
    const users = await User.find({})
      .select('-password') // Exclude password
      .populate('department', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log(`Deleting user ${userId}`);

    // Prevent deleting admin accounts (optional)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if user is admin (optional restriction)
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the only admin user' 
        });
      }
    }

    // Check if user has active complaints
    if (user.role === 'citizen') {
      const hasActiveComplaints = await Complaint.exists({ 
        citizen: userId,
        status: { $in: ['Pending', 'In Progress'] }
      });
      
      if (hasActiveComplaints) {
        return res.status(400).json({ 
          message: 'Cannot delete user with active complaints' 
        });
      }
    }

    // Delete user
    await user.deleteOne();
    
    console.log(`✅ User deleted: ${user.email}`);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({ 
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Get stats in parallel
    const [
      totalUsers,
      totalComplaintsToday,
      pendingComplaints,
      resolvedComplaintsToday,
      recentComplaints,
      userGrowth,
      complaintGrowth
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Complaints today
      Complaint.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      
      // Pending complaints
      Complaint.countDocuments({ status: 'Pending' }),
      
      // Resolved today
      Complaint.countDocuments({
        status: 'Resolved',
        'resolutionDetails.resolvedAt': { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      
      // Recent complaints (last 10)
      Complaint.find({})
        .populate('citizen', 'name email')
        .populate('department', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // User growth (last 30 days)
      User.countDocuments({
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }),
      
      // Complaint growth (last 30 days)
      Complaint.countDocuments({
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    // Calculate percentages
    const totalUsersLastMonth = totalUsers - userGrowth;
    const userGrowthPercentage = totalUsersLastMonth > 0 
      ? Math.round((userGrowth / totalUsersLastMonth) * 100) 
      : 0;
    
    const totalComplaintsLastMonth = totalComplaintsToday - complaintGrowth;
    const complaintGrowthPercentage = totalComplaintsLastMonth > 0 
      ? Math.round((complaintGrowth / totalComplaintsLastMonth) * 100) 
      : 0;

    console.log('✅ Dashboard stats fetched');
    
    res.json({
      totals: {
        users: totalUsers,
        complaintsToday: totalComplaintsToday,
        pending: pendingComplaints,
        resolvedToday: resolvedComplaintsToday
      },
      growth: {
        users: userGrowth,
        usersPercentage: userGrowthPercentage,
        complaints: complaintGrowth,
        complaintsPercentage: complaintGrowthPercentage
      },
      recentActivity: recentComplaints
    });
  } catch (error) {
    console.error('❌ Error in getDashboardStats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  // Department management
  getDepartments,
  createDepartment,
  createDepartmentUsers,
  updateDepartment,
  deleteDepartment,
  assignStaffToDepartment,
  
  // User management
  getAllUsers,
  updateUserStatus,
  deleteUser,
  
  // Analytics
  getSystemAnalytics,
  getDashboardStats
};