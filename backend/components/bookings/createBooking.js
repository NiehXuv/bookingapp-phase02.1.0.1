const { database } = require("../../config/firebaseconfig.js");
const { ref, set, push } = require("firebase/database");

async function createBooking(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      title,
      description,
      date,
      time,
      type,
      details
    } = req.body;

    if (!title || !description || !date || !time || !type || !details) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Validate booking type
    const validTypes = ["hotel", "tour", "transport", "restaurant"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid booking type" });
    }

    // Validate required details based on type
    if (type === "hotel" && !details.hotelId) {
      return res.status(400).json({ error: "Hotel ID is required for hotel bookings" });
    }
    if (type === "tour" && !details.tourId) {
      return res.status(400).json({ error: "Tour ID is required for tour bookings" });
    }
    if (type === "transport" && !details.transportId) {
      return res.status(400).json({ error: "Transport ID is required for transport bookings" });
    }

    const bookingData = {
      title,
      description,
      date,
      time,
      type,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      details: {
        hotelId: details.hotelId || "",
        tourId: details.tourId || "",
        transportId: details.transportId || "",
        price: parseFloat(details.price) || 0,
        currency: details.currency || "USD"
      }
    };

    // Create new booking with auto-generated ID
    const bookingsRef = ref(database, `Users/${uid}/bookings`);
    const newBookingRef = push(bookingsRef);
    const bookingId = newBookingRef.key;

    await set(newBookingRef, bookingData);

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: bookingId,
      booking: bookingData
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { createBooking };
