const { database, get } = require("../../config/firebaseconfig.js");

async function getTripPlan(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    const tripPlanRef = `Users/${uid}/tripPlans/${planId}`;
    const snapshot = await get(tripPlanRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Trip plan not found" });
    }

    const tripPlan = snapshot.val();
    res.status(200).json({
      message: "Trip plan retrieved successfully",
      tripPlan: {
        planId: planId,
        ...tripPlan
      }
    });

  } catch (error) {
    console.error("Error getting trip plan:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getTripPlan };
