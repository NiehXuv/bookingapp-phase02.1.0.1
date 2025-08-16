import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  runOnJS 
} from 'react-native-reanimated';
import PlanningProgressIndicator from '../../components/PlanningProgressIndicator';

const { width } = Dimensions.get('window');

interface BudgetOption {
  id: string;
  title: string;
  range: string;
  selected: boolean;
  icon?: string; // Added for new pill design
}

interface Step4BudgetScreenProps {
  planningData?: any;
  onNext: () => void;
  onCancel: () => void;
  onPrevious: () => void;
  onUpdateData: (data: any) => void;
}

const Step4BudgetScreen: React.FC<Step4BudgetScreenProps> = ({ 
  planningData, 
  onNext, 
  onCancel, 
  onPrevious, 
  onUpdateData 
}) => {
  const [budget, setBudget] = useState(500000);
  const [budgetOptions, setBudgetOptions] = useState<BudgetOption[]>([
    { id: '1', title: 'Budget', range: 'Under 500K VND', selected: false, icon: 'wallet-outline' },
    { id: '2', title: 'Economy', range: '500K - 1M VND', selected: false, icon: 'cash' },
    { id: '3', title: 'Mid-range', range: '1M - 2M VND', selected: false, icon: 'credit-card' },
    { id: '4', title: 'Luxury', range: '2M+ VND', selected: false, icon: 'diamond-stone' },
    { id: '5', title: 'Custom', range: 'Custom amount', selected: false, icon: 'tune' },
  ]);

  // Slider animation values
  const sliderTranslateX = useSharedValue((budget / 5000000) * 300 - 14);
  const sliderWidth = 300; // Fixed slider width

  // Update slider position when budget changes
  useEffect(() => {
    const newPosition = (budget / 5000000) * sliderWidth - 14;
    sliderTranslateX.value = newPosition;
  }, [budget]);

  // Gesture handler for slider (commented out due to Expo SDK 53 compatibility issues)
  /*
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = sliderTranslateX.value;
    },
    onActive: (event, context: any) => {
      try {
        const newTranslateX = context.startX + event.translationX;
        const clampedTranslateX = Math.max(-14, Math.min(newTranslateX, sliderWidth - 14));
        sliderTranslateX.value = clampedTranslateX;
        
        // Calculate budget based on slider position
        const sliderProgress = (clampedTranslateX + 14) / sliderWidth;
        const clampedProgress = Math.max(0, Math.min(1, sliderProgress));
        const newBudget = Math.round(clampedProgress * 5000000);
        
        // Update budget on main thread
        runOnJS(setBudget)(newBudget);
        
        // Update budget options selection
        runOnJS(updateBudgetOptionsSelection)(newBudget);
      } catch (error) {
        console.log('Slider gesture error:', error);
      }
    },
    onEnd: () => {
      try {
        // Ensure slider is within bounds
        const currentPosition = sliderTranslateX.value;
        const clampedPosition = Math.max(-14, Math.min(currentPosition, sliderWidth - 14));
        
        if (clampedPosition !== currentPosition) {
          sliderTranslateX.value = clampedPosition;
        }
        
        // Calculate current budget from slider position
        const currentProgress = (clampedPosition + 14) / sliderWidth;
        const currentBudget = Math.round(currentProgress * 5000000);
        
        // Only snap if very close to a budget option (within 10% of the option value)
        const budgetValues = [250000, 750000, 1500000, 3000000];
        let shouldSnap = false;
        let closestBudget = currentBudget;
        
        for (const optionBudget of budgetValues) {
          const difference = Math.abs(optionBudget - currentBudget);
          const percentageDiff = (difference / optionBudget) * 100;
          
          if (percentageDiff <= 10) { // Within 10% of the option
            closestBudget = optionBudget;
            shouldSnap = true;
            break;
          }
        }
        
        if (shouldSnap) {
          runOnJS(setBudget)(closestBudget);
          
          // Update slider position to snap to closest option
          const snapProgress = closestBudget / 5000000;
          sliderTranslateX.value = snapProgress * sliderWidth - 14;
          
          // Update budget options selection
          runOnJS(updateBudgetOptionsSelection)(closestBudget);
        } else {
          // Keep the custom budget value, don't snap
          runOnJS(setBudget)(currentBudget);
          
          // Update budget options selection
          runOnJS(updateBudgetOptionsSelection)(currentBudget);
        }
      } catch (error) {
        console.log('Slider end error:', error);
      }
    },
  });
  */

  // Animated style for slider handle (simplified for Expo SDK 53 compatibility)
  const animatedSliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderTranslateX.value }],
      backgroundColor: '#FF6B9D',
    };
  });

  // Animated style for slider fill (simplified for Expo SDK 53 compatibility)
  const animatedSliderFillStyle = useAnimatedStyle(() => {
    const progress = (sliderTranslateX.value + 14) / sliderWidth;
    return {
      width: `${Math.max(0, Math.min(100, progress * 100))}%`,
    };
  });

  // Reset slider if it gets stuck
  const resetSlider = () => {
    const currentProgress = budget / 5000000;
    const newPosition = currentProgress * sliderWidth - 14;
    sliderTranslateX.value = newPosition;
  };

  // Handle tapping on slider track
  const handleSliderTrackPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const trackWidth = 300; // Same as sliderWidth
    
    // Calculate budget based on tap position
    const tapProgress = locationX / trackWidth;
    const newBudget = Math.round(tapProgress * 5000000);
    
    setBudget(newBudget);
    
    // Update slider position
    sliderTranslateX.value = tapProgress * trackWidth - 14;
    
    // Update budget options selection
    updateBudgetOptionsSelection(newBudget);
    
    // Immediately save the budget data to PlanningFlowNavigator
    onUpdateData({ budget: newBudget });
  };

  // Handle custom budget input changes
  const handleCustomBudgetChange = (text: string) => {
    const numValue = parseInt(text) || 0;
    if (numValue >= 0) {
      setBudget(numValue);
      updateBudgetOptionsSelection(numValue);
      
      // Immediately save the custom budget data to PlanningFlowNavigator
      onUpdateData({ budget: numValue });
    }
  };

  // Simple touch-based slider handler
  const handleSliderTouch = (event: any) => {
    try {
      const { locationX } = event.nativeEvent;
      const trackWidth = 300; // Same as sliderWidth
      
      // Calculate budget based on touch position (capped at 5M for slider)
      const touchProgress = Math.max(0, Math.min(1, locationX / trackWidth));
      const newBudget = Math.round(touchProgress * 5000000);
      
      setBudget(newBudget);
      
      // Update budget options selection
      updateBudgetOptionsSelection(newBudget);
      
      // Immediately save the budget data to PlanningFlowNavigator
      onUpdateData({ budget: newBudget });
    } catch (error) {
      console.log('Slider touch error:', error);
    }
  };

  // Load existing budget data when component mounts
  useEffect(() => {
    if (planningData?.budget) {
      setBudget(planningData.budget);
      
      // Update slider position
      const sliderProgress = planningData.budget / 5000000;
      sliderTranslateX.value = sliderProgress * sliderWidth - 14;
      
      // Update budget options selection
      updateBudgetOptionsSelection(planningData.budget);
    }
  }, [planningData?.budget]);

  const handleBudgetChange = (value: number) => {
    setBudget(Math.max(0, Math.min(5000000, value)));
  };

  const selectBudgetOption = (id: string) => {
    setBudgetOptions(prev => 
      prev.map(option => ({
        ...option,
        selected: option.id === id
      }))
    );
    
    // Set budget based on selection
    const option = budgetOptions.find(opt => opt.id === id);
    if (option) {
      let newBudget: number;
      switch (option.id) {
        case '1': newBudget = 250000; break;
        case '2': newBudget = 750000; break;
        case '3': newBudget = 1500000; break;
        case '4': newBudget = 3000000; break;
        case '5': 
          // For custom, keep current budget or set to 1M as default
          newBudget = budget > 0 ? budget : 1000000; 
          break;
        default: newBudget = 500000;
      }
      
      if (option.id !== '5') { // Only update budget if not custom
        setBudget(newBudget);
        
        // Update slider position
        const sliderProgress = newBudget / 5000000;
        sliderTranslateX.value = sliderProgress * sliderWidth - 14;
        
        // Immediately save the budget data to PlanningFlowNavigator
        onUpdateData({ budget: newBudget });
      } else {
        // For custom option, save the current budget value
        onUpdateData({ budget: budget });
      }
    }
  };

  const handleNext = () => {
    const selectedOption = budgetOptions.find(option => option.selected);
    if (!selectedOption) {
      // Show validation message
      return;
    }
    
    // Always save the current budget value, regardless of option
    onUpdateData({ budget: budget });
    
    onNext();
  };

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VND`;
    }
    return `${(amount / 1000).toFixed(0)}K VND`;
  };

  // Update budget options selection based on current budget
  const updateBudgetOptionsSelection = (currentBudget: number) => {
    const budgetValues = [250000, 750000, 1500000, 3000000];
    let selectedOptionId = '5'; // Default to custom
    
    // Check if current budget matches any predefined option
    for (let i = 0; i < budgetValues.length; i++) {
      if (Math.abs(budgetValues[i] - currentBudget) < 1000) { // Within 1K VND
        selectedOptionId = (i + 1).toString();
        break;
      }
    }
    
    // If budget doesn't match any predefined option, select custom
    if (selectedOptionId === '5') {
      // Budget is custom (doesn't match predefined options)
      selectedOptionId = '5';
    }
    
    setBudgetOptions(prev => 
      prev.map(option => ({
        ...option,
        selected: option.id === selectedOptionId
      }))
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <PlanningProgressIndicator currentStep={4} />

        {/* Step Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.stepNumber}>Step 4</Text>
          <Text style={styles.stepTitle}>What's your budget?</Text>
        </View>

        {/* Budget Slider Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.sectionTitle}>Set your budget range (per person)</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.budgetValue}>{formatBudget(budget)}</Text>
            </View>
            
            {/* Fallback simple slider if gesture handler fails */}
            <View style={styles.sliderTrack} onTouchEnd={handleSliderTouch}>
              <Animated.View style={[
                styles.sliderFill, 
                { width: `${Math.min(100, (Math.min(budget, 5000000) / 5000000) * 100)}%` }
              ]} />
              <TouchableOpacity
                style={[
                  styles.sliderHandle,
                  { transform: [{ translateX: Math.min(286, (Math.min(budget, 5000000) / 5000000) * 300 - 14) }] }
                ]}
                onPress={() => {
                  console.log('Slider handle pressed');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.handleInner} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0 VND</Text>
              <Text style={styles.sliderLabel}>5M+ VND</Text>
            </View>
          </View>
        </View>

        {/* Quick Budget Options Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.sectionTitle}>Quick budget options</Text>
          <View style={styles.budgetOptionsGrid}>
            {budgetOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.budgetOptionPill,
                  option.selected && styles.selectedBudgetOptionPill
                ]}
                onPress={() => selectBudgetOption(option.id)}
                activeOpacity={0.8}
              >
                <View style={styles.pillContent}>
                  {option.icon && (
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={16}
                      color={option.selected ? '#fff' : '#FF6B9D'}
                    />
                  )}
                  <Text style={[
                    styles.pillText,
                    option.selected && styles.selectedPillText
                  ]}>
                    {option.title}
                  </Text>
                </View>
                <Text style={[
                  styles.pillRange,
                  option.selected && styles.selectedPillRange
                ]}>
                  {option.range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom budget input dropdown */}
          {budgetOptions.find(opt => opt.id === '5')?.selected && (
            <View style={styles.customBudgetContainer}>
              <Text style={styles.customBudgetLabel}>Enter custom budget amount:</Text>
              <View style={styles.customBudgetInputRow}>
                <TextInput
                  style={styles.customBudgetInput}
                  value={budget.toString()}
                  onChangeText={handleCustomBudgetChange}
                  keyboardType="numeric"
                  placeholder="Enter any amount in VND"
                  placeholderTextColor="#8E8E93"
                />
                <Text style={styles.customBudgetSuffix}>VND</Text>
              </View>
              <Text style={styles.customBudgetHint}>
                Enter any amount for your custom budget (Current: {formatBudget(budget)})
              </Text>
              
              {/* Save button for custom budget */}
              <TouchableOpacity 
                style={styles.saveCustomBudgetButton} 
                onPress={() => {
                  onUpdateData({ budget: budget });
                }}
              >
                <Text style={styles.saveCustomBudgetButtonText}>Save Custom Budget</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.previousButton} onPress={onPrevious}>
          <Text style={styles.previousButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(76, 188, 113, 0.08)',
  },
  stepNumber: {
    fontSize: 16,
    color: '#FF8FB1',
    fontWeight: '600',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 22,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(76, 188, 113, 0.08)',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '600',
    marginBottom: 16,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  budgetValue: {
    fontSize: 24,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  sliderTrack: {
    width: 300,
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'visible',
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  budgetOptionsGrid: {
    gap: 12,
    marginTop: 16,
  },
  // Removed old budgetOptionButton styles - no longer needed
  // Removed old summaryCard styles - no longer needed
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  previousButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CBC71',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for pill design
  budgetOptionPill: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedBudgetOptionPill: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.2,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIcon: {
    marginRight: 8,
  },
  pillText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  selectedPillText: {
    color: '#fff',
    fontWeight: '600',
  },
  pillRange: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectedPillRange: {
    color: '#fff',
    fontWeight: '500',
  },
  sliderHandle: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: '#FF6B9D',
    borderRadius: 14,
    top: -10,
    left: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  handleInner: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 7,
  },
  budgetInputContainer: {
    marginBottom: 20,
  },
  budgetInputLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 8,
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  budgetInput: {
    flex: 1,
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '600',
    paddingVertical: 0,
  },
  budgetInputSuffix: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
  },
  customBudgetContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  customBudgetLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 8,
  },
  customBudgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  customBudgetInput: {
    flex: 1,
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '600',
    paddingVertical: 0,
  },
  customBudgetSuffix: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
  },
  customBudgetHint: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  saveCustomBudgetButton: {
    marginTop: 20,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  saveCustomBudgetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Step4BudgetScreen;
