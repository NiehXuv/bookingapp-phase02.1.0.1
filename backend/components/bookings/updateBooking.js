const { database, get, set } = require("../../config/firebaseconfig.js");

async function updateBooking(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { bookingId } = req.params;
    const updateData = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    // Get existing booking
    const bookingRef = `Users/${uid}`/`bookings/${bookingId}`;
    const snapshot = await get(bookingRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const existingBooking = snapshot.val();

    // Validate booking type if updating
    if (updateData.type) {
      const validTypes = ["hotel", "tour", "transport", "restaurant"];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({ error: "Invalid booking type" });
      }
    }

    // Validate status if updating
    if (updateData.status) {
      const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
    }

    // Prepare updated data
    const updatedBooking = {
      ...existingBooking,
      ...updateData,
      updatedAt: Date.now()
    };

    // Ensure required fields are preserved
    if (!updatedBooking.title || !updatedBooking.description || !updatedBooking.date || 
        !updatedBooking.time || !updatedBooking.type || !updatedBooking.details) {
      return res.status(400).json({ error: "All required fields must be preserved" });
    }

    // Update the booking
    await set(bookingRef, updatedBooking);

    res.status(200).json({
      message: "Booking updated successfully",
      booking: {
        bookingId: bookingId,
        ...updatedBooking
      }
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { updateBooking };
