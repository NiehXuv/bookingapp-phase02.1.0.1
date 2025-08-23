const { database, set, push, get } = require("../../config/firebaseconfig.js");
const geminiService = require("../../services/geminiService.js");

async function generateTripPlan(req, res) {
  try {
    const { uid } = req.user;
    const { destinations, tripDays, companion, preferences, budget } = req.body;

    // Validate required fields
    if (!destinations || !tripDays || !companion || !budget) {
      return res.status(400).json({
        error: "Missing required fields: destinations, tripDays, companion, and budget are required"
      });
    }

    // Generate travel plan using Gemini API
    const generatedPlan = await geminiService.generateTravelPlan({
      destinations, tripDays, companion, preferences, budget
    });

    // Return the generated plan WITHOUT saving to Firebase
    // User will save it later when they click "Save Plan"
    res.status(200).json({
      message: "AI travel plan generated successfully",
      generatedContent: generatedPlan,
      // Note: planId is not provided since plan is not saved yet
      // planId will be generated when user clicks "Save Plan"
    });

  } catch (error) {
    console.error("Error generating trip plan:", error);
    
    if (error.message.includes('API key')) {
      res.status(500).json({ error: "AI service configuration error. Please contact support." });
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      res.status(429).json({ error: "AI service is temporarily unavailable due to high demand. Please try again later." });
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      res.status(503).json({ error: "AI service is currently unavailable. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to generate travel plan. Please try again." });
    }
  }
}

module.exports = { generateTripPlan };
