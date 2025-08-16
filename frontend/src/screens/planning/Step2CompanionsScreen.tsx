import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import PlanningProgressIndicator from '../../components/PlanningProgressIndicator';

const { width } = Dimensions.get('window');

interface CompanionOption {
  id: string;
  title: string;
  icon: string;
  selected: boolean;
}

interface Step2CompanionsScreenProps {
  planningData?: any;
  onNext: () => void;
  onCancel: () => void;
  onPrevious: () => void;
  onUpdateData: (data: any) => void;
}

const Step2CompanionsScreen: React.FC<Step2CompanionsScreenProps> = ({ 
  planningData, 
  onNext, 
  onCancel, 
  onPrevious, 
  onUpdateData 
}) => {
  const [companionOptions, setCompanionOptions] = useState<CompanionOption[]>([
    { id: '1', title: 'Solo', icon: 'account', selected: false },
    { id: '2', title: 'Couple', icon: 'heart', selected: false },
    { id: '3', title: 'Family', icon: 'home', selected: false },
    { id: '4', title: 'Group of friends', icon: 'account-group', selected: false },
  ]);

  useEffect(() => {
    if (planningData && planningData.companion) {
      const selectedOption = companionOptions.find(option => option.title === planningData.companion);
      if (selectedOption) {
        setCompanionOptions(prev => 
          prev.map(option => ({
            ...option,
            selected: option.id === selectedOption.id
          }))
        );
      }
    }
  }, [planningData]);

  const handleOptionSelect = (id: string) => {
    setCompanionOptions(prev => 
      prev.map(option => ({
        ...option,
        selected: option.id === id
      }))
    );
  };

  const handleNext = () => {
    const selectedOption = companionOptions.find(option => option.selected);
    if (!selectedOption) {
      // Show alert or handle validation
      return;
    }
    
    // Save companion data before moving to next step
    onUpdateData({ companion: selectedOption.title });
    
    onNext();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <PlanningProgressIndicator currentStep={2} />

        {/* Step Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.stepNumber}>Step 2</Text>
          <Text style={styles.stepTitle}>Who's joining with you?</Text>
        </View>

        {/* Selection Options Card */}
        <View style={styles.optionsCard}>
          {companionOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                option.selected && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect(option.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={option.icon as any}
                size={24}
                color={option.selected ? '#fff' : '#FF6B9D'}
              />
              <Text style={[
                styles.optionText,
                option.selected && styles.selectedOptionText
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onPrevious}>
          <Text style={styles.cancelButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
  optionsCard: {
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
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    backgroundColor: '#fff',
    minHeight: 60,
  },
  selectedOption: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  optionText: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
    marginLeft: 16,
  },
  selectedOptionText: {
    color: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
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
});

export default Step2CompanionsScreen;
