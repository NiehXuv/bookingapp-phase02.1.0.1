import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Alert, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Wand2 } from 'lucide-react-native';
import ChatbotModal from './ChatbotModal';

const { width, height } = Dimensions.get('window');

interface ChatbotFABProps {
  onPress?: () => void;
  isVisible?: boolean;
}

const ChatbotFAB: React.FC<ChatbotFABProps> = ({ onPress, isVisible = true }) => {
  const [position, setPosition] = useState({
    x: width - 80,
    y: height - 200,
  });
  
  const scaleAnim = useState(new Animated.Value(1))[0];
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  // Subtle pulse animation to indicate interactivity
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(pulse, 3000); // Repeat every 3 seconds
      });
    };
    
    if (isVisible) {
      setTimeout(pulse, 2000); // Start after 2 seconds
    }
  }, [isVisible]);

  const handlePress = () => {
    setModalVisible(true);
    if (onPress) {
      onPress();
    }
    // Removed Alert with AI Assistant greeting and options
  };

  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    
    // Calculate new position based on initial position + translation
    const newX = Math.max(0, Math.min(width - 60, position.x + translationX));
    const newY = Math.max(0, Math.min(height - 60, position.y + translationY));
    
    // Update animated values for smooth movement
    translateX.setValue(translationX);
    translateY.setValue(translationY);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      // Calculate final position
      let newX = Math.max(0, Math.min(width - 60, position.x + translationX));
      let newY = Math.max(0, Math.min(height - 60, position.y + translationY));
      
      // Snap to edges if near screen boundaries
      const snapThreshold = 50;
      
      // Snap to left or right edge
      if (newX < snapThreshold) {
        newX = 20;
      } else if (newX > width - snapThreshold - 60) {
        newX = width - 80;
      }
      
      // Snap to top or bottom edge
      if (newY < snapThreshold) {
        newY = 100;
      } else if (newY > height - snapThreshold - 60) {
        newY = height - 200;
      }
      
      // Update position and reset animated values
      setPosition({ x: newX, y: newY });
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View 
          style={[
            styles.container, 
            { 
              left: position.x, 
              top: position.y,
              transform: [
                { scale: scaleAnim },
                { translateX },
                { translateY }
              ]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.fab} 
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Wand2 size={35} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
      <ChatbotModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 172, 198, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotFAB; 