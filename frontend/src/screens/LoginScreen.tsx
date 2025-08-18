import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Dimensions, Modal, ScrollView } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import Svg, { Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

type LoginScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Reusable Message Modal Component
const MessageModal = ({ visible, type, title, message, onClose }: {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}) => {
  const iconColor = type === 'success' ? '#4CBC71' : '#FF6B6B';
  const iconName = type === 'success' ? 'check-circle' : 'error';
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalIconContainer}>
            <MaterialIcons name={iconName} size={48} color={iconColor} />
          </View>
          <Text style={[styles.modalTitle, { color: iconColor }]}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity style={[styles.modalButton, { backgroundColor: iconColor }]} onPress={onClose}>
            <Text style={styles.modalButtonText}>{type === 'success' ? 'OK' : 'Try Again'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      console.log('LoginScreen: Starting login process...');
      await login(email, password);
      console.log('LoginScreen: Login successful, showing success modal');
      setSuccessMessage('Login successful!');
      setSuccessModalVisible(true);
    } catch (error: any) {
      console.error('LoginScreen: Login failed:', error);
      setErrorMessage(error.message || 'Login failed');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setErrorModalVisible(false);
    setErrorMessage('');
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
    setSuccessMessage('');
    if (successMessage.includes('Login successful')) {
      navigation.replace('Main');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FCFCFC' }}>
      {/* SVG Blobs (background) */}
      <Svg
        height={height}
        width={width}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          {/* Green Gradient for Top-Right Blob */}
          <SvgLinearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#4CBC71" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity="0" />
          </SvgLinearGradient>
          {/* Pink Gradient for Bottom-Left Blob */}
          <SvgLinearGradient id="pinkGradient" x1="0" y1="0" x2="0.96" y2="0.28">
            <Stop offset="7.92%" stopColor="#FFACC6" stopOpacity="1" />
            <Stop offset="92.08%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        {/* Top-right green blob */}
        <Ellipse
          cx={width * 1.05} // move further right
          cy={-width * 0.13} // move further up
          rx={width * 0.55} // make larger
          ry={width * 0.55}
          fill="url(#greenGradient)"
        />
        {/* Bottom-left pink blob */}
        <Ellipse
          cx={-width * 0.09} // move further left
          cy={height * 1.08} // move further down
          rx={width * 0.9} // make larger
          ry={width * 0.9}
          fill="url(#pinkGradient)"
        />
      </Svg>
      {/* Blur overlays the blobs */}
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      {/* Main content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          
          <Text style={styles.title}>Sign In</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={22} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(0,28,7,0.3)"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={22} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(0,28,7,0.3)"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="rgba(76,188,113,0.7)" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={26} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={26} color="#1877F3" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.signupContainer} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Error Modal */}
      <MessageModal
        visible={errorModalVisible}
        type="error"
        title="Login Failed"
        message={errorMessage}
        onClose={closeErrorModal}
      />
      {/* Custom Success Modal */}
      <MessageModal
        visible={successModalVisible}
        type="success"
        title="Success"
        message={successMessage}
        onClose={closeSuccessModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  title: {
    color: '#4CBC71',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(76,188,113,0.3)',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 18,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#5881F0',
    fontSize: 16,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#4CBC71',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  orText: {
    marginHorizontal: 10,
    color: 'rgba(0,0,0,0.5)',
    fontSize: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  signupText: {
    fontSize: 15,
    color: 'rgba(27,31,38,0.72)',
  },
  signupLink: {
    color: '#4CBC71',
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4CBC71',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
 