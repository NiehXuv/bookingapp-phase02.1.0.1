import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReelsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Reels Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFCFC' },
  text: { fontSize: 24, color: '#4CBC71' },
});

export default ReelsScreen; 