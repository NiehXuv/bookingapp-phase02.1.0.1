import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PlanningProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const PlanningProgressIndicator: React.FC<PlanningProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps = 4 
}) => {
  const renderSegments = () => {
    const segments = [];
    
    for (let i = 1; i <= totalSteps; i++) {
      let segmentStyle;
      
      if (i < currentStep) {
        // Completed steps
        segmentStyle = styles.completedSegment;
      } else if (i === currentStep) {
        // Current step
        segmentStyle = styles.activeSegment;
      } else {
        // Future steps
        segmentStyle = styles.inactiveSegment;
      }
      
      segments.push(
        <View key={i} style={[styles.progressSegment, segmentStyle]} />
      );
    }
    
    return segments;
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {renderSegments()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  activeSegment: {
    backgroundColor: '#FFB3C7', // Soft pink for active segment
  },
  completedSegment: {
    backgroundColor: '#FF6B9D', // Pink for completed segments
  },
  inactiveSegment: {
    backgroundColor: '#F2F2F7', // Gray for inactive segments
  },
});

export default PlanningProgressIndicator;
