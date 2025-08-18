const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
} = require('../components/bookings');

// Apply middleware to all routes
router.use(verifyToken);

// Create a new booking
router.post('/', createBooking);

// Get all bookings for a user
router.get('/', getAllBookings);

// Get a specific booking
router.get('/:bookingId', getBooking);

// Update a booking
router.put('/:bookingId', updateBooking);

// Delete a booking
router.delete('/:bookingId', deleteBooking);

module.exports = router; 