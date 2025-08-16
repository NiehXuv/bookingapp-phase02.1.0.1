import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ReelsScreen from '../screens/PlanScreen';
import BookingScreen from '../screens/BookingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import DetailScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';


// Import components
import CustomTabBar from '../components/CustomTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        
        {/* Main app */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        
        {/* Detail screens */}
        <Stack.Screen 
          name="HotelDetailScreen" 
          component={HotelDetailScreen}
          options={{ 
            headerShown: true,
            title: 'Hotel Details',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="PlaceDetailScreen" 
          component={PlaceDetailScreen}
          options={{ 
            headerShown: true,
            title: 'Place Details',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="DetailScreen" 
          component={DetailScreen}
          options={{ 
            headerShown: true,
            title: 'Content Details',
            headerBackTitle: 'Back'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
