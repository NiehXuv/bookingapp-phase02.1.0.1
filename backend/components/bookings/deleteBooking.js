const { database, remove, ref } = require("../../config/firebaseconfig.js");

async function deleteBooking(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const bookingRef = `Users/${uid}/bookings/${bookingId}`;
    
    // Delete the booking
    await remove(ref(database, bookingRef));

    res.status(200).json({
      message: "Booking deleted successfully",
      bookingId: bookingId
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { deleteBooking };
