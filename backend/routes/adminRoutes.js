const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  createDepartmentUsers,
  updateDepartment,
  deleteDepartment,
  assignStaffToDepartment,
  getSystemAnalytics,
  updateUserStatus,
  getAllUsers,
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Department routes
router.route('/departments')
  .get(getDepartments)
  .post(createDepartment);

router.post('/departments/create-users', createDepartmentUsers);

router.route('/departments/:id')
  .put(updateDepartment)
  .delete(deleteDepartment);

router.post('/departments/:id/assign-staff', assignStaffToDepartment);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Analytics routes
router.get('/analytics', getSystemAnalytics);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;