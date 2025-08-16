import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import PlanningProgressIndicator from '../../components/PlanningProgressIndicator';

const { width } = Dimensions.get('window');

interface PreferenceOption {
  id: string;
  title: string;
  icon: string;
  selected: boolean;
}

interface Step3PreferencesScreenProps {
  planningData?: any;
  onNext: () => void;
  onCancel: () => void;
  onPrevious: () => void;
  onUpdateData: (data: any) => void;
}

const Step3PreferencesScreen: React.FC<Step3PreferencesScreenProps> = ({ 
  planningData, 
  onNext, 
  onCancel, 
  onPrevious, 
  onUpdateData 
}) => {
  const [vibePreferences, setVibePreferences] = useState<PreferenceOption[]>([
    { id: '1', title: 'Relax', icon: '', selected: false },
    { id: '2', title: 'Explore', icon: '', selected: false },
    { id: '3', title: 'Nature Escape', icon: '', selected: false },
    { id: '4', title: 'Romantic', icon: '', selected: true }, // Pre-selected
    { id: '5', title: 'Urban & Trendy', icon: '', selected: false },
    { id: '6', title: 'Artsy & Creative', icon: '', selected: false },
  ]);

  const [activityPreferences, setActivityPreferences] = useState<PreferenceOption[]>([
    { id: '1', title: 'Nature & Adventure', icon: '', selected: false },
    { id: '2', title: 'Spa & massage', icon: '', selected: false },
    { id: '3', title: 'Beach', icon: '', selected: false },
    { id: '4', title: 'Cultural show', icon: '', selected: false },
    { id: '5', title: 'Temples/Pagodas', icon: '', selected: false },
    { id: '6', title: 'Museum', icon: '', selected: false },
    { id: '7', title: 'Local festivals', icon: '', selected: false },
    { id: '8', title: 'Aesthetic cafés', icon: '', selected: false },
    { id: '9', title: 'Pub & Bar', icon: '', selected: true }, // Pre-selected
  ]);

  const [eatingPreferences, setEatingPreferences] = useState<PreferenceOption[]>([
    { id: '1', title: 'Local cuisine', icon: '', selected: true }, // Pre-selected
    { id: '2', title: 'Vegan', icon: '', selected: false },
    { id: '3', title: 'BBQ', icon: '', selected: false },
    { id: '4', title: 'Street food', icon: '', selected: false },
    { id: '5', title: 'Seafood', icon: '', selected: false },
    { id: '6', title: 'Fine dining', icon: '', selected: false },
    { id: '7', title: 'Cheap eats', icon: '', selected: false },
  ]);

  // Load existing preferences data when component mounts
  useEffect(() => {
    if (planningData?.preferences) {
      const existingPreferences = planningData.preferences;
      
      // Update vibe preferences
      setVibePreferences(prev => 
        prev.map(pref => ({
          ...pref,
          selected: existingPreferences.includes(pref.title)
        }))
      );
      
      // Update activity preferences
      setActivityPreferences(prev => 
        prev.map(pref => ({
          ...pref,
          selected: existingPreferences.includes(pref.title)
        }))
      );
      
      // Update eating preferences
      setEatingPreferences(prev => 
        prev.map(pref => ({
          ...pref,
          selected: existingPreferences.includes(pref.title)
        }))
      );
    }
  }, [planningData?.preferences]);

  const toggleVibePreference = (id: string) => {
    setVibePreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, selected: !pref.selected } : pref
      )
    );
  };

  const toggleActivityPreference = (id: string) => {
    setActivityPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, selected: !pref.selected } : pref
      )
    );
  };

  const toggleEatingPreference = (id: string) => {
    setEatingPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, selected: !pref.selected } : pref
      )
    );
  };

  const handleNext = () => {
    const selectedVibes = vibePreferences.filter(pref => pref.selected);
    const selectedActivities = activityPreferences.filter(pref => pref.selected);
    const selectedEating = eatingPreferences.filter(pref => pref.selected);
    
    if (selectedVibes.length === 0 || selectedActivities.length === 0 || selectedEating.length === 0) {
      // Show validation message
      return;
    }
    
    // Save preferences data before moving to next step
    const preferencesData = {
      vibePreferences: selectedVibes.map(pref => pref.title),
      activityPreferences: selectedActivities.map(pref => pref.title),
      eatingPreferences: selectedEating.map(pref => pref.title),
      allPreferences: [
        ...selectedVibes.map(pref => pref.title),
        ...selectedActivities.map(pref => pref.title),
        ...selectedEating.map(pref => pref.title)
      ]
    };
    
    console.log('Step 3 - Saving preferences:', preferencesData);
    onUpdateData({ preferences: preferencesData.allPreferences });
    
    onNext();
  };

  const renderPreferencePill = (pref: PreferenceOption, onToggle: (id: string) => void) => (
    <TouchableOpacity
      key={pref.id}
      style={[
        styles.preferencePill,
        pref.selected && styles.selectedPreferencePill
      ]}
      onPress={() => onToggle(pref.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.pillText,
        pref.selected && styles.selectedPillText
      ]}>
        {pref.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <PlanningProgressIndicator currentStep={3} />

        {/* Step Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.stepNumber}>Step 3</Text>
          <Text style={styles.stepTitle}>Tell me what you like</Text>
        </View>

        {/* Vibe Preferences Card */}
        <View style={styles.preferencesCard}>
          <Text style={styles.sectionTitle}>The vibe you want</Text>
          <View style={styles.preferencesGrid}>
            {vibePreferences.map((pref) => renderPreferencePill(pref, toggleVibePreference))}
          </View>
        </View>

        {/* Activity Preferences Card */}
        <View style={styles.preferencesCard}>
          <Text style={styles.sectionTitle}>Your activities preferences</Text>
          <View style={styles.preferencesGrid}>
            {activityPreferences.map((pref) => renderPreferencePill(pref, toggleActivityPreference))}
          </View>
        </View>

        {/* Eating Preferences Card */}
        <View style={styles.preferencesCard}>
          <Text style={styles.sectionTitle}>Your eating preferences</Text>
          <View style={styles.preferencesGrid}>
            {eatingPreferences.map((pref) => renderPreferencePill(pref, toggleEatingPreference))}
          </View>
        </View>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.previousButton} onPress={onPrevious}>
          <Text style={styles.previousButtonText}>Previous</Text>
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
  preferencesCard: {
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
  sectionTitle: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '600',
    marginBottom: 16,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  preferencePill: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedPreferencePill: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.2,
  },
  pillText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedPillText: {
    color: '#fff',
    fontWeight: '600',
  },
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
  bottomSpacing: {
    height: 100, // Adjust as needed for spacing
  },
});

export default Step3PreferencesScreen;
