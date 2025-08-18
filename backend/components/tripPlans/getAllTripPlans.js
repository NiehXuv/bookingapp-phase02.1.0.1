const { database, get } = require("../../config/firebaseconfig.js");

async function getAllTripPlans(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { status } = req.query; // Optional filter by status

    const tripPlansRef = `Users/${uid}`/tripPlans;
    const snapshot = await get(tripPlansRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No trip plans found",
        tripPlans: []
      });
    }

    let tripPlans = [];
    snapshot.forEach((childSnapshot) => {
      const planId = childSnapshot.key;
      const planData = childSnapshot.val();
      
      // Filter by status if provided
      if (status && planData.status !== status) {
        return;
      }
      
      tripPlans.push({
        planId: planId,
        ...planData
      });
    });

    res.status(200).json({
      message: "Trip plans retrieved successfully",
      tripPlans: tripPlans,
      count: tripPlans.length
    });

  } catch (error) {
    console.error("Error getting trip plans:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getAllTripPlans };
