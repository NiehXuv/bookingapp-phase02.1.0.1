const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createTripPlan,
  getTripPlan,
  getAllTripPlans,
  updateTripPlan,
  deleteTripPlan
} = require('../components/tripPlans');

// Apply middleware to all routes
router.use(verifyToken);

// Create a new trip plan
router.post('/', createTripPlan);

// Get all trip plans for a user
router.get('/', getAllTripPlans);

// Get a specific trip plan
router.get('/:planId', getTripPlan);

// Update a trip plan
router.put('/:planId', updateTripPlan);

// Delete a trip plan
router.delete('/:planId', deleteTripPlan);

module.exports = router;
