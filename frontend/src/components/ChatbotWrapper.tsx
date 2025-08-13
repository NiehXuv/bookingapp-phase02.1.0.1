import React from 'react';
import { useRoute } from '@react-navigation/native';
import ChatbotFAB from './ChatbotFAB';

const ChatbotWrapper: React.FC = () => {
  const route = useRoute();

  // List of screens where chatbot should NOT appear (search screens)
  const searchScreens = [
    'HotelSearch',
    'TransportSearch', 
    'TourSearch',
    'SearchHotelResult',
    'SearchTransportResult',
  ];

  // Check if current screen is a search screen
  const isSearchScreen = searchScreens.includes(route?.name as string);
  
  // Don't show chatbot on search screens
  if (isSearchScreen) {
    return null;
  }

  return <ChatbotFAB />;
};

export default ChatbotWrapper; 