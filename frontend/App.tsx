import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
// import other screens as needed
import CustomTabBar from './src/components/CustomTabBar';
import ChatbotWrapper from './src/components/ChatbotWrapper';
import PlanScreen from './src/screens/PlanScreen';
import InboxScreen from './src/screens/InboxScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchHotelResultScreen from './src/screens/SearchHotelResultScreen';
import HotelDetailScreen from './src/screens/HotelDetailScreen';
import PlaceDetailScreen from './src/screens/PlaceDetailScreen';
import SearchTransportResultScreen from './src/screens/SearchTransportResultScreen';
import SearchTourResultScreen from './src/screens/SearchTourResultScreen';
import DetailScreen from './src/screens/ContentDetailScreen';
import UniversalSearchScreen from './src/screens/UniversalSearchScreen';
import SearchContentResultScreen from './src/screens/SearchContentResultScreen';
import TransportDetailScreen from './src/screens/TransportDetailScreen';
import PlanningFlowNavigator from './src/screens/planning/PlanningFlowNavigator';
import PlanningSummaryScreen from './src/screens/planning/PlanningSummaryScreen';
import PlanningDetailScreen from './src/screens/planning/PlanningDetailScreen';
import PlanManualScreen from './src/screens/planning/PlanManualScreen';
import ExploreScreen from './src/screens/ExploreScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ContentProvider } from './src/context/ContentContext';
import { SearchProvider } from './src/context/SearchContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <CustomTabBar {...props} />}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Plan" component={PlanScreen} />
        <Tab.Screen name="Inbox" component={InboxScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <ChatbotWrapper />
    </View>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuth();
  
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="UniversalSearch" component={UniversalSearchScreen} />
            <Stack.Screen name="SearchContentResult" component={SearchContentResultScreen} />
            <Stack.Screen name="SearchHotelResult" component={SearchHotelResultScreen} />
            <Stack.Screen name="SearchTransportResult" component={SearchTransportResultScreen} />
            <Stack.Screen name="SearchTourResult" component={SearchTourResultScreen} />
            <Stack.Screen name="HotelDetailScreen" component={HotelDetailScreen as any} />
            <Stack.Screen name="PlaceDetailScreen" component={PlaceDetailScreen as any} />
            <Stack.Screen name="DetailScreen" component={DetailScreen} />
            <Stack.Screen name="TransportDetailScreen" component={TransportDetailScreen as any} />
            <Stack.Screen name="PlanningFlow" component={PlanningFlowNavigator} />
            <Stack.Screen name="PlanningSummary" component={PlanningSummaryScreen} />
            <Stack.Screen name="PlanningDetail" component={PlanningDetailScreen} />
            <Stack.Screen name="PlanManual" component={PlanManualScreen} />
            <Stack.Screen name="Inbox" component={InboxScreen} />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ContentProvider>
          <SearchProvider>
            <NavigationContainer>
              <StatusBar />
              <RootNavigator />
            </NavigationContainer>
          </SearchProvider>
        </ContentProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});