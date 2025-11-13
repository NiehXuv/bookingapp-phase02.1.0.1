export interface MembershipTier {
  id: string;
  name: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  price: number;
  currency: string;
  duration: number; // in months
  color: string;
  icon: string;
  benefits: string[];
  discount: number; // percentage discount
  pointsMultiplier: number;
  prioritySupport: boolean;
  exclusiveAccess: string[];
  description: string;
  popular?: boolean;
}

export interface MembershipBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'discount' | 'points' | 'access' | 'support' | 'exclusive';
}

export const mockMembershipTiers: MembershipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Membership',
    level: 'Bronze',
    price: 0,
    currency: 'VND',
    duration: 0, // Free, lifetime
    color: '#CD7F32',
    icon: 'medal',
    benefits: [
      'Basic booking discounts (5% off)',
      'Standard customer support',
      'Access to basic travel guides',
      'Earn 1x points on bookings',
      'Monthly newsletter'
    ],
    discount: 5,
    pointsMultiplier: 1,
    prioritySupport: false,
    exclusiveAccess: [],
    description: 'Perfect for occasional travelers. Start your journey with basic benefits and discounts.',
    popular: false,
  },
  {
    id: 'silver',
    name: 'Silver Membership',
    level: 'Silver',
    price: 500000,
    currency: 'VND',
    duration: 12,
    color: '#C0C0C0',
    icon: 'award',
    benefits: [
      'Enhanced booking discounts (10% off)',
      'Priority customer support',
      'Access to premium travel guides',
      'Earn 1.5x points on bookings',
      'Exclusive member-only deals',
      'Early access to promotions',
      'Free cancellation (up to 24h)'
    ],
    discount: 10,
    pointsMultiplier: 1.5,
    prioritySupport: true,
    exclusiveAccess: ['Premium guides', 'Member deals'],
    description: 'Great value for regular travelers. Enjoy enhanced benefits and priority support.',
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold Membership',
    level: 'Gold',
    price: 1500000,
    currency: 'VND',
    duration: 12,
    color: '#FFD700',
    icon: 'star',
    benefits: [
      'Premium booking discounts (15% off)',
      '24/7 VIP customer support',
      'Access to all travel guides and content',
      'Earn 2x points on bookings',
      'Exclusive member-only deals',
      'Early access to promotions',
      'Free cancellation (up to 48h)',
      'Complimentary travel insurance',
      'Airport lounge access (select locations)'
    ],
    discount: 15,
    pointsMultiplier: 2,
    prioritySupport: true,
    exclusiveAccess: ['All guides', 'VIP deals', 'Lounge access'],
    description: 'Premium experience for frequent travelers. Enjoy maximum benefits and VIP treatment.',
    popular: false,
  },
  {
    id: 'platinum',
    name: 'Platinum Membership',
    level: 'Platinum',
    price: 3000000,
    currency: 'VND',
    duration: 12,
    color: '#E5E4E2',
    icon: 'crown',
    benefits: [
      'Elite booking discounts (20% off)',
      '24/7 Concierge service',
      'Access to all travel guides and content',
      'Earn 2.5x points on bookings',
      'Exclusive member-only deals',
      'Early access to promotions',
      'Free cancellation (up to 72h)',
      'Complimentary travel insurance',
      'Airport lounge access (all locations)',
      'Personal travel consultant',
      'Complimentary room upgrades (when available)',
      'Welcome gifts at select hotels'
    ],
    discount: 20,
    pointsMultiplier: 2.5,
    prioritySupport: true,
    exclusiveAccess: ['All guides', 'Elite deals', 'Lounge access', 'Personal consultant'],
    description: 'Elite membership for the most discerning travelers. Experience luxury at every step.',
    popular: false,
  },
  {
    id: 'diamond',
    name: 'Diamond Membership',
    level: 'Diamond',
    price: 5000000,
    currency: 'VND',
    duration: 12,
    color: '#B9F2FF',
    icon: 'gem',
    benefits: [
      'Maximum booking discounts (25% off)',
      '24/7 Personal Concierge service',
      'Access to all travel guides and content',
      'Earn 3x points on bookings',
      'Exclusive member-only deals',
      'Early access to promotions',
      'Free cancellation (up to 7 days)',
      'Complimentary premium travel insurance',
      'Airport lounge access (all locations)',
      'Dedicated travel consultant',
      'Guaranteed room upgrades (when available)',
      'Welcome gifts and amenities at all hotels',
      'Private event invitations',
      'Lifetime membership benefits'
    ],
    discount: 25,
    pointsMultiplier: 3,
    prioritySupport: true,
    exclusiveAccess: ['All guides', 'Diamond deals', 'Lounge access', 'Personal consultant', 'Private events'],
    description: 'The ultimate travel experience. Exclusive benefits and personalized service for lifetime members.',
    popular: false,
  },
];

export const mockMembershipBenefits: MembershipBenefit[] = [
  {
    id: '1',
    title: 'Exclusive Discounts',
    description: 'Save up to 25% on hotels, tours, and activities with higher membership tiers.',
    icon: 'percent',
    category: 'discount',
  },
  {
    id: '2',
    title: 'Points Multiplier',
    description: 'Earn bonus points on every booking. Higher tiers earn up to 3x points.',
    icon: 'star',
    category: 'points',
  },
  {
    id: '3',
    title: 'Priority Support',
    description: 'Get faster response times and dedicated support channels.',
    icon: 'headphones',
    category: 'support',
  },
  {
    id: '4',
    title: 'Early Access',
    description: 'Be the first to know about new promotions and exclusive deals.',
    icon: 'bell',
    category: 'access',
  },
  {
    id: '5',
    title: 'Free Cancellation',
    description: 'Enjoy flexible cancellation policies with longer grace periods.',
    icon: 'refresh-cw',
    category: 'access',
  },
  {
    id: '6',
    title: 'Travel Insurance',
    description: 'Complimentary travel insurance coverage with premium memberships.',
    icon: 'shield',
    category: 'exclusive',
  },
  {
    id: '7',
    title: 'Lounge Access',
    description: 'Relax in airport lounges at select locations worldwide.',
    icon: 'coffee',
    category: 'exclusive',
  },
  {
    id: '8',
    title: 'Room Upgrades',
    description: 'Get complimentary room upgrades at participating hotels.',
    icon: 'home',
    category: 'exclusive',
  },
];

export const getMembershipTierById = (id: string): MembershipTier | undefined => {
  return mockMembershipTiers.find(tier => tier.id === id);
};

export const getPopularMemberships = (): MembershipTier[] => {
  return mockMembershipTiers.filter(tier => tier.popular);
};

