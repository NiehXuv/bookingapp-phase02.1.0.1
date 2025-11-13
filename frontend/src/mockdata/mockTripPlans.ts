import { GeneratedTripPlan, PlanningData, GenerateTripPlanResponse } from '../services/geminiService';
import { getMockPlaces } from './mockPlaces';

// Generate mock trip plan based on planning data
export const generateMockTripPlan = (planningData: PlanningData): GenerateTripPlanResponse => {
  const destinations = planningData.destinations.join(', ');
  const tripDays = planningData.tripDays || 7;
  const companion = planningData.companion || 'Solo';
  const budget = planningData.budget || 2000000;

  // Generate dates starting from today
  const startDate = new Date();
  const dates: string[] = [];
  for (let i = 0; i < tripDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  // Generate activities for each day
  const days = dates.map((date, index) => {
    const dayNumber = index + 1;
    const activities = generateDayActivities(dayNumber, destinations, companion);
    
    return {
      day: dayNumber,
      date: date,
      title: `Day ${dayNumber}: Explore ${destinations}`,
      description: `Discover the best of ${destinations} with carefully curated activities for ${companion.toLowerCase()} travelers.`,
      activities: activities,
      meals: {
        breakfast: 'Local Vietnamese breakfast',
        lunch: 'Traditional restaurant',
        dinner: 'Street food experience'
      },
      accommodation: dayNumber === 1 ? 'Hotel in city center' : 'Continue at hotel',
      transportation: dayNumber === 1 ? 'Airport transfer' : 'Local transport',
      estimatedCost: `VND ${Math.round(budget / tripDays).toLocaleString()}`
    };
  });

  const plan: GeneratedTripPlan = {
    planName: `Perfect ${tripDays}-Day Trip to ${destinations}`,
    summary: `Experience the beauty and culture of ${destinations} with this ${tripDays}-day itinerary designed for ${companion.toLowerCase()} travelers. From historic landmarks to local cuisine, this plan offers a perfect blend of sightseeing, relaxation, and authentic experiences within your budget of VND ${budget.toLocaleString()}.`,
    itinerary: {
      days: days
    },
    totalEstimatedCost: `VND ${budget.toLocaleString()}`,
    travelTips: [
      'Carry cash for local markets and street vendors',
      'Download offline maps before your trip',
      'Learn basic Vietnamese phrases for better communication',
      'Respect local customs and traditions',
      'Stay hydrated and use sunscreen',
      'Keep copies of important documents',
      'Try local street food but be cautious with hygiene'
    ],
    packingList: [
      'Comfortable walking shoes',
      'Lightweight clothing',
      'Rain jacket or umbrella',
      'Sunscreen and hat',
      'Insect repellent',
      'Travel adapter',
      'First aid kit',
      'Camera or smartphone',
      'Portable charger',
      'Travel documents',
      'Water bottle',
      'Snacks for long journeys'
    ],
    emergencyContacts: {
      localEmergency: '113 (Police), 115 (Ambulance), 114 (Fire)',
      embassy: 'Check your country\'s embassy in Vietnam'
    }
  };

  return {
    message: 'Trip plan generated successfully',
    generatedContent: plan
  };
};

// Generate activities for a specific day
function generateDayActivities(dayNumber: number, destination: string, companion: string): Array<{
  time: string;
  activity: string;
  location: string;
  duration: string;
  cost: string;
  notes: string;
}> {
  const activities: Array<{
    time: string;
    activity: string;
    location: string;
    duration: string;
    cost: string;
    notes: string;
  }> = [];

  // Morning activities
  const morningActivities = [
    { activity: 'Visit Historic Temple', location: 'Old Quarter', time: '08:00' },
    { activity: 'Explore Local Market', location: 'Central Market', time: '09:00' },
    { activity: 'Museum Tour', location: 'History Museum', time: '09:30' },
    { activity: 'Lake Walk', location: 'Hoan Kiem Lake', time: '08:30' },
    { activity: 'Coffee Experience', location: 'Coffee Street', time: '10:00' }
  ];

  // Afternoon activities
  const afternoonActivities = [
    { activity: 'Lunch at Local Restaurant', location: 'Old Quarter', time: '12:00' },
    { activity: 'Shopping District', location: 'Shopping Street', time: '14:00' },
    { activity: 'Cultural Show', location: 'Theater', time: '15:00' },
    { activity: 'Park Visit', location: 'City Park', time: '14:30' },
    { activity: 'Art Gallery', location: 'Art District', time: '15:30' }
  ];

  // Evening activities
  const eveningActivities = [
    { activity: 'Sunset Viewpoint', location: 'Observation Deck', time: '17:00' },
    { activity: 'Street Food Tour', location: 'Food Street', time: '18:00' },
    { activity: 'Night Market', location: 'Night Market', time: '19:00' },
    { activity: 'Rooftop Bar', location: 'City Center', time: '20:00' },
    { activity: 'Traditional Performance', location: 'Cultural Center', time: '19:30' }
  ];

  // Select activities based on day number (rotate through options)
  const morningIndex = (dayNumber - 1) % morningActivities.length;
  const afternoonIndex = (dayNumber - 1) % afternoonActivities.length;
  const eveningIndex = (dayNumber - 1) % eveningActivities.length;

  activities.push({
    time: morningActivities[morningIndex].time,
    activity: morningActivities[morningIndex].activity,
    location: `${morningActivities[morningIndex].location}, ${destination}`,
    duration: '2-3 hours',
    cost: 'VND 50,000 - 200,000',
    notes: companion === 'Solo' ? 'Perfect for solo exploration' : 'Great for groups'
  });

  activities.push({
    time: afternoonActivities[afternoonIndex].time,
    activity: afternoonActivities[afternoonIndex].activity,
    location: `${afternoonActivities[afternoonIndex].location}, ${destination}`,
    duration: '2-4 hours',
    cost: 'VND 100,000 - 500,000',
    notes: 'Take breaks and stay hydrated'
  });

  activities.push({
    time: eveningActivities[eveningIndex].time,
    activity: eveningActivities[eveningIndex].activity,
    location: `${eveningActivities[eveningIndex].location}, ${destination}`,
    duration: '2-3 hours',
    cost: 'VND 150,000 - 800,000',
    notes: 'Enjoy the local nightlife'
  });

  return activities;
}

// Get mock place for activity enhancement
export const getMockPlaceForActivity = (activityName: string, location: string) => {
  const places = getMockPlaces();
  
  // Try to find a matching place
  const activityLower = activityName.toLowerCase();
  const locationLower = location.toLowerCase();
  
  // Match by activity type
  if (activityLower.includes('temple') || activityLower.includes('pagoda')) {
    return places.find(p => p.type === 'Temple' || p.name.toLowerCase().includes('temple')) || places[0];
  }
  if (activityLower.includes('lake') || activityLower.includes('water')) {
    return places.find(p => p.type === 'Lake' || p.name.toLowerCase().includes('lake')) || places[0];
  }
  if (activityLower.includes('museum')) {
    return places.find(p => p.type === 'Museum' || p.name.toLowerCase().includes('museum')) || places[1];
  }
  if (activityLower.includes('market')) {
    return places.find(p => p.name.toLowerCase().includes('market')) || places[2];
  }
  if (activityLower.includes('park')) {
    return places.find(p => p.type === 'Park' || p.name.toLowerCase().includes('park')) || places[3];
  }
  
  // Default to first place
  return places[0];
};

