const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createTripPlan,
  getTripPlan,
  getAllTripPlans,
  updateTripPlan,
  updateActivityTime,
  addActivity,
  deleteTripPlan,
  generateTripPlan
} = require('../components/tripPlans');

// Apply middleware to all routes
router.use(verifyToken);

// Create a new trip plan
router.post('/', createTripPlan);

// Generate AI travel plan
router.post('/generate', generateTripPlan);

// Get all trip plans for a user
router.get('/', getAllTripPlans);

// Get a specific trip plan
router.get('/:planId', getTripPlan);

// Update a trip plan
router.put('/:planId', updateTripPlan);

// Update activity time and day
router.put('/:planId/activities/time', updateActivityTime);

// Add new activity to a day
router.post('/:planId/activities', addActivity);

// Delete a trip plan
router.delete('/:planId', deleteTripPlan);

module.exports = router;
