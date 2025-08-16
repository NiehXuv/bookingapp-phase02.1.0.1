import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Step1DestinationScreen from './Step1DestinationScreen';
import Step2CompanionsScreen from './Step2CompanionsScreen';
import Step3PreferencesScreen from './Step3PreferencesScreen';
import Step4BudgetScreen from './Step4BudgetScreen';

interface PlanningData {
  destinations: string[];
  tripDays: number;
  companion: string;
  preferences: any[];
  budget: number;
}

const PlanningFlowNavigator: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentStep, setCurrentStep] = useState(1);
  const [planningData, setPlanningData] = useState<Partial<PlanningData>>({});

  // Initialize with existing planning data if editing
  useEffect(() => {
    const routeParams = (route.params as any);
    if (routeParams?.planningData) {
      console.log('PlanningFlowNavigator - Initializing with existing data:', routeParams.planningData);
      setPlanningData(routeParams.planningData);
      
      // Determine which step to start from based on what data is available
      if (routeParams.planningData.budget !== undefined) {
        setCurrentStep(4); // Start from budget step if budget exists
      } else if (routeParams.planningData.preferences && routeParams.planningData.preferences.length > 0) {
        setCurrentStep(3); // Start from preferences step if preferences exist
      } else if (routeParams.planningData.companion) {
        setCurrentStep(2); // Start from companions step if companion exists
      } else if (routeParams.planningData.destinations && routeParams.planningData.destinations.length > 0) {
        setCurrentStep(1); // Start from destinations step if destinations exist
      }
    }
  }, [route.params]);

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updatePlanningData = (newData: Partial<PlanningData>) => {
    console.log('PlanningFlowNavigator - Updating data:', newData);
    setPlanningData(prev => {
      const updated = { ...prev, ...newData };
      console.log('PlanningFlowNavigator - Updated data:', updated);
      return updated;
    });
  };

  const handleComplete = () => {
    // TODO: Process final planning data
    console.log('PlanningFlowNavigator - Final planningData state:', planningData);
    console.log('PlanningFlowNavigator - Budget value:', planningData.budget);
    console.log('PlanningFlowNavigator - Budget type:', typeof planningData.budget);
    
    const finalData: PlanningData = {
      destinations: planningData.destinations || ['Hanoi'],
      tripDays: planningData.tripDays || 7,
      companion: planningData.companion || 'Solo',
      preferences: planningData.preferences || [],
      budget: planningData.budget !== undefined ? planningData.budget : 200,
    };
    
    console.log('Planning completed:', finalData);
    // Navigate to PlanningSummary screen with the data
    (navigation as any).navigate('PlanningSummary', { planningData: finalData });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1DestinationScreen
            planningData={planningData}
            onNext={goToNextStep}
            onCancel={() => navigation.goBack()}
            onUpdateData={updatePlanningData}
          />
        );
      case 2:
        return (
          <Step2CompanionsScreen
            planningData={planningData}
            onNext={goToNextStep}
            onCancel={() => navigation.goBack()}
            onPrevious={goToPreviousStep}
            onUpdateData={updatePlanningData}
          />
        );
      case 3:
        return (
          <Step3PreferencesScreen
            planningData={planningData}
            onNext={goToNextStep}
            onCancel={() => navigation.goBack()}
            onPrevious={goToPreviousStep}
            onUpdateData={updatePlanningData}
          />
        );
      case 4:
        return (
          <Step4BudgetScreen
            planningData={planningData}
            onNext={handleComplete}
            onCancel={() => navigation.goBack()}
            onPrevious={goToPreviousStep}
            onUpdateData={updatePlanningData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PlanningFlowNavigator;
