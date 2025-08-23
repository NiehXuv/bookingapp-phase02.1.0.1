// 🚀 Hotel Cache Service - Persists across navigation
class HotelCacheService {
  private cache: { [key: string]: { data: any[], timestamp: number } } = {};
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  // Get cached results for a city
  getCachedResults(city: string): any[] | null {
    const cacheKey = city.toLowerCase();
    const cachedData = this.cache[cacheKey];
    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp) < this.CACHE_DURATION) {
      console.log(`⚡ Cache hit for ${city}: ${cachedData.data.length} hotels`);
      return cachedData.data;
    }

    if (cachedData) {
      console.log(`🔄 Cache expired for ${city}: age ${now - cachedData.timestamp}ms`);
    } else {
      console.log(`🔄 No cache for ${city}`);
    }

    return null;
  }

  // Cache results for a city
  cacheResults(city: string, data: any[]): void {
    const cacheKey = city.toLowerCase();
    this.cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    console.log(`💾 Cached ${data.length} hotels for ${city}`);
  }

  // Check if city has valid cache
  hasValidCache(city: string): boolean {
    const cacheKey = city.toLowerCase();
    const cachedData = this.cache[cacheKey];
    const now = Date.now();

    return !!(cachedData && (now - cachedData.timestamp) < this.CACHE_DURATION);
  }

  // Get cache info for debugging
  getCacheInfo(): { [key: string]: { count: number, age: number, valid: boolean } } {
    const now = Date.now();
    const info: { [key: string]: { count: number, age: number, valid: boolean } } = {};

    Object.entries(this.cache).forEach(([city, data]) => {
      const age = now - data.timestamp;
      const valid = age < this.CACHE_DURATION;
      info[city] = {
        count: data.data.length,
        age,
        valid
      };
    });

    return info;
  }

  // Clear cache for a specific city
  clearCityCache(city: string): void {
    const cacheKey = city.toLowerCase();
    if (this.cache[cacheKey]) {
      delete this.cache[cacheKey];
      console.log(`🧹 Cleared cache for ${city}`);
    }
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache = {};
    console.log(`🧹 Cleared all cache`);
  }

  // Get cache size
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }
}

// Export singleton instance
export const hotelCacheService = new HotelCacheService();
