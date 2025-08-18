const { database, set, push, get } = require("../../config/firebaseconfig.js");

async function createTripPlan(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      planName,
      destinations,
      tripDays,
      companion,
      preferences,
      budget,
      status = "draft"
    } = req.body;

    if (!planName || !destinations || !tripDays || !companion || !preferences || !budget) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Validate companion type
    const validCompanions = ["Solo", "Couple", "Family", "Group of friends"];
    if (!validCompanions.includes(companion)) {
      return res.status(400).json({ error: "Invalid companion type" });
    }

    // Validate status
    const validStatuses = ["draft", "active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const tripPlanData = {
      planName,
      destinations,
      tripDays: parseInt(tripDays),
      companion,
      preferences: {
        vibePreferences: preferences.vibePreferences || [],
        activityPreferences: preferences.activityPreferences || [],
        eatingPreferences: preferences.eatingPreferences || [],
        budgetRange: preferences.budgetRange || "",
        travelStyle: preferences.travelStyle || ""
      },
      budget: parseFloat(budget),
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      itinerary: {
        days: []
      }
    };

    // Create new trip plan with auto-generated ID
    const tripPlansPath = `Users/${uid}/tripPlans`;
    const newTripPlanRef = database.ref(tripPlansPath).push();
    const planId = newTripPlanRef.key;

    await set(`${tripPlansPath}/${planId}`, tripPlanData);

    res.status(201).json({
      message: "Trip plan created successfully",
      planId: planId,
      tripPlan: tripPlanData
    });

  } catch (error) {
    console.error("Error creating trip plan:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { createTripPlan };
