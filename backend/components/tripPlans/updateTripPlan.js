const { database } = require("../../config/firebaseconfig.js");
const { ref, get, set } = require("firebase/database");

async function updateTripPlan(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { planId } = req.params;
    const updateData = req.body;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    // Get existing trip plan
    const tripPlanRef = ref(database, `Users/${uid}/tripPlans/${planId}`);
    const snapshot = await get(tripPlanRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Trip plan not found" });
    }

    const existingPlan = snapshot.val();

    // Validate companion type if updating
    if (updateData.companion) {
      const validCompanions = ["Solo", "Couple", "Family", "Group of friends"];
      if (!validCompanions.includes(updateData.companion)) {
        return res.status(400).json({ error: "Invalid companion type" });
      }
    }

    // Validate status if updating
    if (updateData.status) {
      const validStatuses = ["draft", "active", "completed", "cancelled"];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
    }

    // Prepare updated data
    const updatedPlan = {
      ...existingPlan,
      ...updateData,
      updatedAt: Date.now()
    };

    // Ensure required fields are preserved
    if (!updatedPlan.planName || !updatedPlan.destinations || !updatedPlan.tripDays || 
        !updatedPlan.companion || !updatedPlan.preferences || !updatedPlan.budget) {
      return res.status(400).json({ error: "All required fields must be preserved" });
    }

    // Update the trip plan
    await set(tripPlanRef, updatedPlan);

    res.status(200).json({
      message: "Trip plan updated successfully",
      tripPlan: {
        planId: planId,
        ...updatedPlan
      }
    });

  } catch (error) {
    console.error("Error updating trip plan:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { updateTripPlan };
