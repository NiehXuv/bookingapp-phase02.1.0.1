import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ContentItem } from '../types/content';

interface SearchContextType {
  // Search query state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Active tab state
  activeTab: 'Content' | 'Stay' | 'Services' | 'Transport';
  setActiveTab: (tab: 'Content' | 'Stay' | 'Services' | 'Transport') => void;
  
  // Search results state for each tab
  contentResults: ContentItem[];
  setContentResults: (results: ContentItem[]) => void;
  
  hotelResults: any[];
  setHotelResults: (results: any[]) => void;
  
  serviceResults: any[];
  setServiceResults: (results: any[]) => void;
  
  transportResults: any[];
  setTransportResults: (results: any[]) => void;
  
  // Loading states for each tab
  isLoadingContent: boolean;
  setIsLoadingContent: (loading: boolean) => void;
  
  isLoadingHotels: boolean;
  setIsLoadingHotels: (loading: boolean) => void;
  
  isLoadingServices: boolean;
  setIsLoadingServices: (loading: boolean) => void;
  
  isLoadingTransport: boolean;
  setIsLoadingTransport: (loading: boolean) => void;
  
  // Last search queries for each tab
  lastContentQuery: string;
  setLastContentQuery: (query: string) => void;
  
  lastHotelQuery: string;
  setLastHotelQuery: (query: string) => void;
  
  lastServiceQuery: string;
  setLastServiceQuery: (query: string) => void;
  
  lastTransportQuery: string;
  setLastTransportQuery: (query: string) => void;
  
  // Clear search state
  clearSearch: () => void;
  clearAllSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Content' | 'Stay' | 'Services' | 'Transport'>('Content');

  // Search results state
  const [contentResults, setContentResults] = useState<ContentItem[]>([]);
  const [hotelResults, setHotelResults] = useState<any[]>([]);
  const [serviceResults, setServiceResults] = useState<any[]>([]);
  const [transportResults, setTransportResults] = useState<any[]>([]);

  // Loading states
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);

  // Last search queries
  const [lastContentQuery, setLastContentQuery] = useState('');
  const [lastHotelQuery, setLastHotelQuery] = useState('');
  const [lastServiceQuery, setLastServiceQuery] = useState('');
  const [lastTransportQuery, setLastTransportQuery] = useState('');

  const clearSearch = () => {
    setSearchQuery('');
    setActiveTab('Content');
  };

  const clearAllSearches = () => {
    setSearchQuery('');
    setActiveTab('Content');
    setContentResults([]);
    setHotelResults([]);
    setServiceResults([]);
    setTransportResults([]);
    setIsLoadingContent(false);
    setIsLoadingHotels(false);
    setIsLoadingServices(false);
    setIsLoadingTransport(false);
    setLastContentQuery('');
    setLastHotelQuery('');
    setLastServiceQuery('');
    setLastTransportQuery('');
  };

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    
    // Search results
    contentResults,
    setContentResults,
    hotelResults,
    setHotelResults,
    serviceResults,
    setServiceResults,
    transportResults,
    setTransportResults,
    
    // Loading states
    isLoadingContent,
    setIsLoadingContent,
    isLoadingHotels,
    setIsLoadingHotels,
    isLoadingServices,
    setIsLoadingServices,
    isLoadingTransport,
    setIsLoadingTransport,
    
    // Last search queries
    lastContentQuery,
    setLastContentQuery,
    lastHotelQuery,
    setLastHotelQuery,
    lastServiceQuery,
    setLastServiceQuery,
    lastTransportQuery,
    setLastTransportQuery,
    
    clearSearch,
    clearAllSearches,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
