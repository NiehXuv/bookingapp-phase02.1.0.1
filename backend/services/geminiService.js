const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
    }
    
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async generateTravelPlan(planningData) {
    try {
      const prompt = this.buildPrompt(planningData);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await axios.post(`${this.baseURL}?key=${this.apiKey}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
        throw new Error('Invalid response format from Gemini API');
      }

      const text = response.data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // If no JSON block found, try to parse the entire response
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error generating travel plan with Gemini:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Gemini API Error Response:', error.response.data);
        console.error('Status:', error.response.status);
        
        if (error.response.status === 400) {
          throw new Error('Invalid request to Gemini API - check your API key and request format');
        } else if (error.response.status === 403) {
          throw new Error('Access denied to Gemini API - check your API key and billing status');
        } else if (error.response.status === 429) {
          throw new Error('Rate limit exceeded for Gemini API - try again later');
        } else if (error.response.status >= 500) {
          throw new Error('Gemini API server error - try again later');
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from Gemini API - check your internet connection');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Failed to generate travel plan: ${error.message}`);
      }
    }
  }

  buildPrompt(planningData) {
    const { destinations, tripDays, companion, preferences, budget } = planningData;
    
    return `You are an expert travel planner. Create a concise, user-friendly travel itinerary for a ${tripDays}-day trip to ${destinations.join(', ')}.

Travel Details:
- Destinations: ${destinations.join(', ')}
- Duration: ${tripDays} days
- Travel Style: ${companion}
- Budget: ${budget} VND per person
- Preferences: ${this.formatPreferences(preferences)}

IMPORTANT: Keep all content SHORT and CONCISE. Users prefer quick, scannable information.

Please generate a travel plan in the following JSON format:

\`\`\`json
{
  "planName": "Short, catchy trip name (max 8 words)",
  "summary": "One sentence overview (max 15 words)",
  "itinerary": {
    "days": [
      {
        "day": 1,
        "date": "Day 1",
        "title": "Very short day title (max 5 words)",
        "description": "One sentence description (max 20 words)",
        "activities": [
          {
            "time": "09:00",
            "activity": "Short activity name (max 8 words)",
            "location": "Location name (max 6 words)",
            "duration": "Duration (e.g., '2h', '30m')",
            "cost": "Cost (e.g., '50K VND', 'Free')",
            "notes": "Optional brief note (max 10 words)"
          }
        ],
        "meals": {
          "breakfast": "Quick meal suggestion (max 6 words)",
          "lunch": "Quick meal suggestion (max 6 words)", 
          "dinner": "Quick meal suggestion (max 6 words)"
        },
        "estimatedCost": "Day cost (e.g., '200K VND')"
      }
    ]
  },
  "totalEstimatedCost": "Total cost (e.g., '1.5M VND per person')",
  "travelTips": [
    "Tip 1 (max 12 words)",
    "Tip 2 (max 12 words)",
    "Tip 3 (max 12 words)",
    "Tip 4 (max 12 words)",
    "Tip 5 (max 12 words)",
    "Tip 6 (max 12 words)",
    "Tip 7 (max 12 words)",
    "Tip 8 (max 12 words)"
  ],
  "packingList": [
    "Essential item 1 (max 4 words)",
    "Essential item 2 (max 4 words)",
    "Essential item 3 (max 4 words)",
    "Essential item 4 (max 4 words)",
    "Essential item 5 (max 4 words)",
    "Essential item 6 (max 4 words)",
    "Essential item 7 (max 4 words)",
    "Essential item 8 (max 4 words)",
    "Essential item 9 (max 4 words)",
    "Essential item 10 (max 4 words)"
  ],
  "emergencyContacts": {
    "localEmergency": "113 (Police), 115 (Ambulance)",
    "embassy": "Check embassy website for current info"
  }
}
\`\`\`

GUIDELINES:
- Keep ALL text short and scannable
- Use bullet points and brief descriptions
- Focus on essential information only
- Avoid long paragraphs or detailed explanations
- Make it mobile-friendly and easy to read quickly
- Ensure the JSON is valid and properly formatted`;
  }

  formatPreferences(preferences) {
    if (!preferences || preferences.length === 0) {
      return 'No specific preferences';
    }
    
    if (Array.isArray(preferences)) {
      return preferences.join(', ');
    }
    
    // Handle object-based preferences
    const prefArray = [];
    if (preferences.vibePreferences && preferences.vibePreferences.length > 0) {
      prefArray.push(`Vibe: ${preferences.vibePreferences.join(', ')}`);
    }
    if (preferences.activityPreferences && preferences.activityPreferences.length > 0) {
      prefArray.push(`Activities: ${preferences.activityPreferences.join(', ')}`);
    }
    if (preferences.eatingPreferences && preferences.eatingPreferences.length > 0) {
      prefArray.push(`Food: ${preferences.eatingPreferences.join(', ')}`);
    }
    if (preferences.travelStyle) {
      prefArray.push(`Style: ${preferences.travelStyle}`);
    }
    
    return prefArray.length > 0 ? prefArray.join('; ') : 'No specific preferences';
  }
}

module.exports = new GeminiService();
