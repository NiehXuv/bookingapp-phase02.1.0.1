const { database, get, set } = require('../../config/firebaseconfig');

const addActivity = async (req, res) => {
  try {
    const { planId } = req.params;
    const { dayIndex, activity } = req.body;
    const { uid } = req.user;

    console.log('🔍 Backend addActivity called with:', {
      planId,
      dayIndex,
      activity,
      uid
    });

    if (!planId || dayIndex === undefined || !activity) {
      return res.status(400).json({
        error: 'Missing required fields: planId, dayIndex, and activity are required'
      });
    }

    // Validate activity object
    if (!activity.time || !activity.activity || !activity.location) {
      return res.status(400).json({
        error: 'Activity must have time, activity name, and location'
      });
    }

    // Validate dayIndex
    if (dayIndex < 0) {
      return res.status(400).json({
        error: 'Day index must be non-negative'
      });
    }

    // Try to find the trip plan with different planId variations
    let tripPlanRef = `Users/${uid}/tripPlans/${planId}`;
    let planSnapshot = await get(tripPlanRef);
    
    // If not found, try with leading hyphen
    if (!planSnapshot.exists() && !planId.startsWith('-')) {
      const planIdWithHyphen = `-${planId}`;
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithHyphen}`;
      console.log('🔍 Backend: Trying with hyphen prefix:', tripPlanRef);
      planSnapshot = await get(tripPlanRef);
    }
    
    // If still not found, try without leading hyphen
    if (!planSnapshot.exists() && planId.startsWith('-')) {
      const planIdWithoutHyphen = planId.substring(1);
      tripPlanRef = `Users/${uid}/tripPlans/${planIdWithoutHyphen}`;
      console.log('🔍 Backend: Trying without hyphen prefix:', tripPlanRef);
      planSnapshot = await get(tripPlanRef);
    }

    console.log('🔍 Backend: Final search path:', tripPlanRef);

    if (!planSnapshot.exists()) {
      console.log('🔍 Backend: Trip plan not found at any path');
      
      // Try to list available plans for debugging
      try {
        const userPlansRef = `Users/${uid}/tripPlans`;
        const userPlansSnapshot = await get(userPlansRef);
        if (userPlansSnapshot.exists()) {
          const userPlans = userPlansSnapshot.val();
          const planKeys = Object.keys(userPlans);
          console.log('🔍 Backend: Available plan keys for user:', planKeys);
          console.log('🔍 Backend: Looking for planId:', planId);
          console.log('🔍 Backend: Plan keys include requested planId?', planKeys.includes(planId));
          console.log('🔍 Backend: Plan keys include planId with hyphen?', planKeys.includes(`-${planId}`));
          console.log('🔍 Backend: Plan keys include planId without hyphen?', planKeys.includes(planId.startsWith('-') ? planId.substring(1) : planId));
        }
      } catch (debugError) {
        console.log('🔍 Backend: Could not debug user plans:', debugError.message);
      }
      
      return res.status(404).json({
        error: 'Trip plan not found'
      });
    }

    const planData = planSnapshot.val();
    console.log('🔍 Backend: Successfully found trip plan:', planData.planName);

    // Remove the unnecessary ownership check since Firebase path already ensures ownership
    // if (planData.userId !== uid) {
    //   return res.status(403).json({
    //     error: 'Access denied: You can only modify your own trip plans'
    //   });
    // }

    // Validate dayIndex is within range
    if (!planData.itinerary || !planData.itinerary.days || dayIndex >= planData.itinerary.days.length) {
      return res.status(400).json({
        error: 'Invalid day index: Day does not exist in this trip plan'
      });
    }

    // Create the new activity object
    const newActivity = {
      time: activity.time,
      activity: activity.activity,
      location: activity.location,
      cost: activity.cost || 'Free',
      notes: activity.notes || '',
      isPinned: false
    };

    console.log('🔍 Backend: Adding new activity:', newActivity);

    // Add the new activity to the specified day
    const updatedDays = [...planData.itinerary.days];
    updatedDays[dayIndex].activities.push(newActivity);

    // Sort activities by time within the day
    updatedDays[dayIndex].activities.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.time}`);
      const timeB = new Date(`2000-01-01 ${b.time}`);
      return timeA - timeB;
    });

    // Update the plan in the database
    await set(tripPlanRef, {
      ...planData,
      itinerary: {
        ...planData.itinerary,
        days: updatedDays
      },
      updatedAt: new Date().toISOString()
    });

    console.log('🔍 Backend: Successfully updated trip plan in database');

    // Return the updated plan
    const updatedPlanSnapshot = await get(tripPlanRef);
    const updatedPlan = updatedPlanSnapshot.val();

    res.status(200).json({
      message: 'Activity added successfully',
      tripPlan: updatedPlan
    });

  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({
      error: 'Internal server error while adding activity'
    });
  }
};

module.exports = addActivity;
