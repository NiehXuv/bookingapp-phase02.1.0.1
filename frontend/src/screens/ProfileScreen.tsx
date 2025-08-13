import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/profile.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user ? user.username : 'Username'}</Text>
        <Text style={styles.email}>{user ? user.email : 'user@email.com'}</Text>
        {user?.phoneNumber && (
          <Text style={styles.phoneNumber}>{user.phoneNumber}</Text>
        )}
      </View>
      
      {/* Profile Actions */}
      <View style={styles.actionsContainer}>
        {!isAuthenticated && (
          <TouchableOpacity style={styles.button} onPress={() => (navigation as any).navigate('Login')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        )}
        {isAuthenticated && (
          <>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.signOutButton, isLoggingOut && styles.buttonDisabled]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <Text style={[styles.buttonText, styles.signOutButtonText]}>
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFCFC',
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CBC71',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B6F7E',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#6B6F7E',
    marginTop: 8,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: 220,
    height: 48,
    backgroundColor: '#4CBC71',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CBC71',
  },
  signOutButtonText: {
    color: '#4CBC71',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ProfileScreen; 