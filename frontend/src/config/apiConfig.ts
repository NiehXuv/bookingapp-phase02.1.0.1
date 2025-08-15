// API Configuration
export const API_CONFIG = {
  YOUTUBE: {
    API_KEY: 'AIzaSyCtbREGKCFH0eDSA065TYqT7p4B0TLcw6Y', 
    BASE_URL: 'https://www.googleapis.com/youtube/v3',
    MAX_RESULTS: 25, // Increased for better freshness
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 60,
      REQUESTS_PER_DAY: 10000
    }
  },
  TRIPADVISOR: {
    API_KEY: '11CC8F76C2E14125B8DF907D5EF0CFFF',
    BASE_URL: 'https://api.content.tripadvisor.com/api/v1',
    MAX_RESULTS: 25 // Increased for better freshness
  },
  PIXABAY: {
    API_KEY: '51774912-6461414aabd2518fe4241056f', // Get free key from pixabay.com/api/docs/
    BASE_URL: 'https://pixabay.com/api',
    MAX_RESULTS: 25 // Increased for better freshness
  },
  PEXELS: {
    API_KEY: 'vtSosCHrNwU8ZUIpoWfXW3jwEm9xMVpkD2nsZEdgOUhlofjpatLYXGBN', // Get free key from pexels.com/api/
    BASE_URL: 'https://api.pexels.com/v1',
    MAX_RESULTS: 25 // Increased for better freshness
  },
  GOOGLE_PLACES: {
    API_KEY: 'AIzaSyBeylcpLJ2AwqVCRXa5k8PpGWNitQZhV_s', // Get from Google Cloud Console
    BASE_URL: 'https://maps.googleapis.com/maps/api/place',
    MAX_RESULTS: 20,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 50,
      REQUESTS_PER_DAY: 2000
    }
  },
  AMADEUS: {
    API_KEY: 'xTCqf89AlcUFoUzg15AfGbYDgxh4WFDW',
    API_SECRET: 'Fk4KhjJsdWFEkqOg',
    BASE_URL: 'https://test.api.amadeus.com',
    ENVIRONMENT: 'test', // or 'production'
  }
};

// Environment check
export const isDevelopment = __DEV__;

// Get API key with fallback
export const getYouTubeApiKey = (): string => {
  const apiKey = API_CONFIG.YOUTUBE.API_KEY;
  if (apiKey === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ YouTube API key not configured. Please add your API key to apiConfig.ts');
    return '';
  }
  return apiKey;
};

// Get Google Places API key with fallback
export const getGooglePlacesApiKey = (): string => {
  const apiKey = API_CONFIG.GOOGLE_PLACES.API_KEY;
  if (apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
    console.warn('⚠️ Google Places API key not configured. Please add your API key to apiConfig.ts');
    return '';
  }
  return apiKey;
};

export const getAmadeusApiKey = (): string => {
  const key = process.env.AMADEUS_API_KEY || API_CONFIG.AMADEUS.API_KEY;
  if (key === 'YOUR_AMADEUS_API_KEY') {
    console.warn('⚠️ Amadeus API key not configured. Please set AMADEUS_API_KEY in your .env file');
  }
  return key;
};

export const getAmadeusApiSecret = (): string => {
  const secret = process.env.AMADEUS_CLIENT_SECRET || API_CONFIG.AMADEUS.API_SECRET;
  if (secret === 'YOUR_AMADEUS_CLIENT_SECRET') {
    console.warn('⚠️ Amadeus API secret not configured. Please set AMADEUS_CLIENT_SECRET in your .env file');
  }
  return secret;
};


// Check YouTube API quota
export const checkYouTubeQuota = async (): Promise<{ remaining: number; resetTime: string } | null> => {
  try {
    const apiKey = getYouTubeApiKey();
    if (!apiKey) return null;
    
    const response = await fetch(
      `${API_CONFIG.YOUTUBE.BASE_URL}/channels?part=snippet&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${apiKey}`
    );
    
    if (response.status === 403) {
      const errorData = await response.json();
      if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
        return { remaining: 0, resetTime: 'Next day at midnight PST' };
      }
    }
    
    // If successful, quota is still available
    return { remaining: 1000, resetTime: 'Unknown' };
  } catch (error) {
    console.error('Error checking quota:', error);
    return null;
  }
};

// Rate limiting utilities
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const now = Date.now();
    const timeSinceOldest = now - oldestRequest;
    
    return Math.max(0, this.timeWindow - timeSinceOldest);
  }
}
