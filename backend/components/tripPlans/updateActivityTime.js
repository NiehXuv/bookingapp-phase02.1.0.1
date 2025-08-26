const { database, get, set } = require("../../config/firebaseconfig.js");

async function updateActivityTime(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { planId } = req.params;
    const { dayIndex, activityIndex, newTime, newDayIndex } = req.body;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    if (dayIndex === undefined || activityIndex === undefined) {
      return res.status(400).json({ error: "Day index and activity index are required" });
    }

    if (!newTime && newDayIndex === undefined) {
      return res.status(400).json({ error: "Either new time or new day index must be provided" });
    }

    // Get existing trip plan
    let tripPlanRef = `Users/${uid}/tripPlans/${planId}`;
    let snapshot = await get(tripPlanRef);
    
    // If not found, try with leading hyphen
    if (!snapshot.exists() && !planId.startsWith('-')) {
      const planIdWithHyphen = `-${planId}`;
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithHyphen}`;
      console.log('🔍 Backend updateActivityTime: Trying with hyphen prefix:', tripPlanRef);
      snapshot = await get(tripPlanRef);
    }
    
    // If still not found, try without leading hyphen
    if (!snapshot.exists() && planId.startsWith('-')) {
      const planIdWithoutHyphen = planId.substring(1);
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithoutHyphen}`;
      console.log('🔍 Backend updateActivityTime: Trying without hyphen prefix:', tripPlanRef);
      snapshot = await get(tripPlanRef);
    }

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Trip plan not found" });
    }

    const existingPlan = snapshot.val();

    // Validate day index
    if (!existingPlan.itinerary || !existingPlan.itinerary.days || 
        dayIndex < 0 || dayIndex >= existingPlan.itinerary.days.length) {
      return res.status(400).json({ error: "Invalid day index" });
    }

    // Validate activity index
    const currentDay = existingPlan.itinerary.days[dayIndex];
    if (!currentDay.activities || activityIndex < 0 || activityIndex >= currentDay.activities.length) {
      return res.status(400).json({ error: "Invalid activity index" });
    }

    // Validate new day index if provided
    if (newDayIndex !== undefined) {
      if (newDayIndex < 0 || newDayIndex >= existingPlan.itinerary.days.length) {
        return res.status(400).json({ error: "Invalid new day index" });
      }
    }

    // Validate time format (HH:MM)
    if (newTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
      return res.status(400).json({ error: "Invalid time format. Use HH:MM format" });
    }

    // Create a copy of the existing plan
    const updatedPlan = { ...existingPlan };

    if (newDayIndex !== undefined && newDayIndex !== dayIndex) {
      // Move activity to different day
      const activityToMove = { ...currentDay.activities[activityIndex] };
      
      // Remove from current day
      updatedPlan.itinerary.days[dayIndex].activities.splice(activityIndex, 1);
      
      // Add to new day
      if (!updatedPlan.itinerary.days[newDayIndex].activities) {
        updatedPlan.itinerary.days[newDayIndex].activities = [];
      }
      
      // Update time if provided
      if (newTime) {
        activityToMove.time = newTime;
      }
      
      updatedPlan.itinerary.days[newDayIndex].activities.push(activityToMove);
      
      // Sort activities by time in the new day
      updatedPlan.itinerary.days[newDayIndex].activities.sort((a, b) => {
        const timeA = new Date(`2000-01-01 ${a.time}`);
        const timeB = new Date(`2000-01-01 ${b.time}`);
        return timeA - timeB;
      });
      
    } else if (newTime) {
      // Just update time in the same day
      updatedPlan.itinerary.days[dayIndex].activities[activityIndex].time = newTime;
      
      // Sort activities by time in the current day
      updatedPlan.itinerary.days[dayIndex].activities.sort((a, b) => {
        const timeA = new Date(`2000-01-01 ${a.time}`);
        const timeB = new Date(`2000-01-01 ${b.time}`);
        return timeA - timeB;
      });
    }

    // Update timestamp
    updatedPlan.updatedAt = Date.now();

    // Save updated plan
    await set(tripPlanRef, updatedPlan);

    res.status(200).json({
      message: "Activity updated successfully",
      tripPlan: {
        planId: planId,
        itinerary: updatedPlan.itinerary
      }
    });

  } catch (error) {
    console.error("Error updating activity time:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { updateActivityTime };
