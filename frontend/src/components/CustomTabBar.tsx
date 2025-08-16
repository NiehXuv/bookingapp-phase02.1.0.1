import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TAB_ICONS = [
  { name: 'home', lib: MaterialCommunityIcons, label: 'Home' },
  { name: 'search', lib: Feather, label: 'Explore' },
  { name: 'map', lib: Feather, label: 'Plan' },
  { name: 'calendar', lib: Feather, label: 'Booking' },
  { name: 'user', lib: Feather, label: 'Profile' },
];

const BAR_WIDTH = width - 40; // 20px margin on each side
const BAR_HEIGHT = 90;
const TAB_SIZE = 54;
const ICON_SIZE = 30;
const TAB_GAP = 15;

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="light" />
      <LinearGradient
        colors={["rgba(252,252,252,0.9)", "rgba(238,238,238,0.9)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;
            const isFocused = state.index === index;
            const iconInfo = TAB_ICONS[index];
            const IconComponent = iconInfo.lib;
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                //testID={options.tabBarTestID}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={[styles.tab, isFocused && styles.activeTab]}
                activeOpacity={0.85}
              >
                <View style={[styles.tabCircle, isFocused && styles.activeTabCircle]}> 
                  <IconComponent
                    name={iconInfo.name as any}
                    size={ICON_SIZE}
                    color={isFocused ? '#FCFCFC' : '#B3B4BB'}
                  />
                  <Text style={[styles.label, isFocused && styles.activeLabel]}>{iconInfo.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
      <View style={styles.borderOverlay} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 32 : 20,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  gradient: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#001C08',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 16,
  },
  borderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    zIndex: 2,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: BAR_WIDTH - 40, // inner padding
    alignSelf: 'center',
    height: 74,
    marginTop: 8,
    marginBottom: 8,
    gap: TAB_GAP,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: 15,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
  },
  tabCircle: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: 15,
    backgroundColor:"rgba(252,252,252,0.9)",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  activeTab: {},
  activeTabCircle: {
    backgroundColor: '#4CBC71',
    borderColor: '#fff',
    shadowColor: '#73C088',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    color: '#B3B4BB',
    marginTop: 2,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : undefined,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FCFCFC',
    fontWeight: '500',
  },
});

export default CustomTabBar; 