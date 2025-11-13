export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  image: any;
  description: string;
  discount?: string;
  validFrom: string;
  validTo: string;
  termsAndConditions: string[];
  category: 'hotel' | 'tour' | 'restaurant' | 'activity' | 'general';
  featured?: boolean;
}

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'VIETNAM CULTURAL INDUSTRIES SHOW 2024',
    subtitle: 'July 11th - 13th, 2024',
    location: 'WORLD TRADE CENTER',
    image: require('../../assets/hanoi.jpg'),
    description: 'Join us for the biggest cultural event of the year! Experience traditional Vietnamese arts, crafts, music, and cuisine. Special discounts on hotels and tours during the event period.',
    discount: 'Up to 30% OFF',
    validFrom: '2024-07-01',
    validTo: '2024-07-20',
    termsAndConditions: [
      'Valid for bookings made between July 1-20, 2024',
      'Minimum stay of 2 nights required',
      'Cannot be combined with other promotions',
      'Subject to availability'
    ],
    category: 'general',
    featured: true,
  },
  {
    id: '2',
    title: 'Explore Amazing Destinations',
    subtitle: 'Discover Vietnam',
    location: 'Multiple Locations',
    image: require('../../assets/hoian.jpg'),
    description: 'Discover the beauty of Vietnam with our special promotion. Visit Hoi An, Ha Long Bay, Sapa, and more with exclusive discounts on tours and accommodations.',
    discount: '25% OFF',
    validFrom: '2024-08-01',
    validTo: '2024-12-31',
    termsAndConditions: [
      'Valid for bookings until December 31, 2024',
      'Applies to selected destinations only',
      'Early booking required (at least 7 days in advance)',
      'Limited availability'
    ],
    category: 'tour',
    featured: true,
  },
  {
    id: '3',
    title: 'Summer Hotel Special',
    subtitle: 'Beat the Heat',
    location: 'Coastal Resorts',
    image: require('../../assets/nhatrang.jpg'),
    description: 'Escape to beautiful coastal resorts this summer. Enjoy luxurious accommodations with stunning ocean views at special summer rates.',
    discount: '20% OFF',
    validFrom: '2024-06-01',
    validTo: '2024-08-31',
    termsAndConditions: [
      'Valid for summer bookings (June-August)',
      'Minimum 3 nights stay required',
      'Includes breakfast',
      'Non-refundable rate'
    ],
    category: 'hotel',
    featured: true,
  },
  {
    id: '4',
    title: 'Mountain Adventure Package',
    subtitle: 'Sapa & Ha Giang',
    location: 'Northern Vietnam',
    image: require('../../assets/sapa.jpg'),
    description: 'Experience the breathtaking mountain landscapes of Northern Vietnam. Complete package including accommodation, guided tours, and meals.',
    discount: '15% OFF',
    validFrom: '2024-09-01',
    validTo: '2024-11-30',
    termsAndConditions: [
      'Valid for September to November 2024',
      'Package includes 3 days 2 nights',
      'Group bookings (minimum 2 people)',
      'Weather-dependent activities'
    ],
    category: 'tour',
    featured: true,
  },
  {
    id: '5',
    title: 'Culinary Journey',
    subtitle: 'Taste of Vietnam',
    location: 'Hanoi & Ho Chi Minh City',
    image: require('../../assets/hue.jpg'),
    description: 'Embark on a culinary adventure through Vietnam\'s most famous food destinations. Special restaurant partnerships and food tour discounts.',
    discount: '30% OFF',
    validFrom: '2024-08-01',
    validTo: '2024-10-31',
    termsAndConditions: [
      'Valid for food tours and partner restaurants',
      'Advance reservation required',
      'Some restaurants may have limited availability',
      'Dietary restrictions must be notified in advance'
    ],
    category: 'restaurant',
    featured: true,
  },
  {
    id: '6',
    title: 'Luxury Resort Experience',
    subtitle: 'Premium Getaway',
    location: 'Phu Quoc & Da Nang',
    image: require('../../assets/himalaya_hotel.jpg'),
    description: 'Indulge in luxury at Vietnam\'s most prestigious resorts. Exclusive access to spa facilities, private beaches, and premium dining.',
    discount: '35% OFF',
    validFrom: '2024-09-01',
    validTo: '2024-12-31',
    termsAndConditions: [
      'Valid for luxury resort category only',
      'Minimum 4 nights stay',
      'Includes spa access and premium amenities',
      'Blackout dates may apply'
    ],
    category: 'hotel',
    featured: true,
  },
];

export const getFeaturedPromotions = (): Promotion[] => {
  return mockPromotions.filter(p => p.featured);
};

export const getPromotionById = (id: string): Promotion | undefined => {
  return mockPromotions.find(p => p.id === id);
};

export const getPromotionsByCategory = (category: Promotion['category']): Promotion[] => {
  return mockPromotions.filter(p => p.category === category);
};
