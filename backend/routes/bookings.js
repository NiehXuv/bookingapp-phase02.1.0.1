const express = require('express');
const router = express.Router();

// Mock bookings database (replace with MongoDB in production)
let bookings = [];

// Get all bookings
router.get('/', (req, res) => {
  try {
    res.json({
      message: 'Bookings retrieved successfully',
      bookings: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings by user (MUST come before /:id route)
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userBookings = bookings.filter(b => b.userId === userId);
    
    res.json({
      message: 'User bookings retrieved successfully',
      bookings: userBookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({
      message: 'Booking retrieved successfully',
      booking: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new booking
router.post('/', (req, res) => {
  try {
    const { title, description, date, time, userId } = req.body;

    // Validate input
    if (!title || !date || !userId) {
      return res.status(400).json({ message: 'Title, date, and userId are required' });
    }

    const newBooking = {
      id: Date.now().toString(),
      title,
      description: description || '',
      date,
      time: time || '',
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    bookings.push(newBooking);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, status } = req.body;

    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      title: title || bookings[bookingIndex].title,
      description: description !== undefined ? description : bookings[bookingIndex].description,
      date: date || bookings[bookingIndex].date,
      time: time !== undefined ? time : bookings[bookingIndex].time,
      status: status || bookings[bookingIndex].status,
      updatedAt: new Date()
    };

    res.json({
      message: 'Booking updated successfully',
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const deletedBooking = bookings.splice(bookingIndex, 1)[0];

    res.json({
      message: 'Booking deleted successfully',
      booking: deletedBooking
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 