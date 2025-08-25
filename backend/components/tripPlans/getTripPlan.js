const { database, get } = require("../../config/firebaseconfig.js");

async function getTripPlan(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    // Try to find the trip plan with different planId variations
    let tripPlanRef = `Users/${uid}/tripPlans/${planId}`;
    let snapshot = await get(tripPlanRef);
    
    // If not found, try with leading hyphen
    if (!snapshot.exists() && !planId.startsWith('-')) {
      const planIdWithHyphen = `-${planId}`;
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithHyphen}`;
      console.log('🔍 Backend getTripPlan: Trying with hyphen prefix:', tripPlanRef);
      snapshot = await get(tripPlanRef);
    }
    
    // If still not found, try without leading hyphen
    if (!snapshot.exists() && planId.startsWith('-')) {
      const planIdWithoutHyphen = planId.substring(1);
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithoutHyphen}`;
      console.log('🔍 Backend getTripPlan: Trying without hyphen prefix:', tripPlanRef);
      snapshot = await get(tripPlanRef);
    }

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
