const { database, get } = require("../../config/firebaseconfig.js");

async function getBooking(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const bookingRef = `Users/${uid}`/`bookings/${bookingId}`;
    const snapshot = await get(bookingRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = snapshot.val();
    res.status(200).json({
      message: "Booking retrieved successfully",
      booking: {
        bookingId: bookingId,
        ...booking
      }
    });

  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getBooking };
