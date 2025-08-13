import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlanScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Plan Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFCFC' },
  text: { fontSize: 24, color: '#4CBC71' },
});

export default PlanScreen; 