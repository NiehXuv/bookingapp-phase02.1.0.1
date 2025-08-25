const { database, remove } = require("../../config/firebaseconfig.js");

async function deleteTripPlan(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    // Try to find the trip plan with different planId variations
    let tripPlanRef = `Users/${uid}/tripPlans/${planId}`;
    
    // If not found, try with leading hyphen
    if (!planId.startsWith('-')) {
      const planIdWithHyphen = `-${planId}`;
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithHyphen}`;
      console.log('🔍 Backend deleteTripPlan: Using hyphen prefix:', tripPlanRef);
    }
    
    // Delete the trip plan
    await remove(tripPlanRef);

    res.status(200).json({
      message: "Trip plan deleted successfully",
      planId: planId
    });

  } catch (error) {
    console.error("Error deleting trip plan:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { deleteTripPlan };
