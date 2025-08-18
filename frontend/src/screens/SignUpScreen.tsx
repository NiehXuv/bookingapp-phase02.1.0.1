import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';


// Common country codes for easier selection
const commonCountries = [
  { code: 'US', name: 'United States' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'IN', name: 'India' },
];

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const { signup } = useAuth();

  // Debug: Log countries on component mount
  console.log('SignUpScreen mounted, countries:', commonCountries);

  // Handle success navigation after 2 seconds with countdown
  useEffect(() => {
    if (successModalVisible) {
      setCountdown(2);
      
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setSuccessModalVisible(false);
            navigation.navigate('Login' as never);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownTimer);
    }
  }, [successModalVisible, navigation]);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword || !country || !phoneNumber) {
      setErrorMessage('Please fill in all fields');
      setErrorModalVisible(true);
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setErrorModalVisible(true);
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setErrorModalVisible(true);
      return false;
    }

    if (username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long');
      setErrorModalVisible(true);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setErrorModalVisible(true);
      return false;
    }

    // Basic phone validation (at least 7 digits)
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      setErrorMessage('Please enter a valid phone number');
      setErrorModalVisible(true);
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(username, email, password, country, phoneNumber);
      setSuccessModalVisible(true);
      // Clear form fields after successful signup
      resetForm();
    } catch (error: any) {
      setErrorMessage(error.message || 'Signup failed');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCountry('');
    setPhoneNumber('');
    setShowCountryPicker(false);
  };

  const closeErrorModal = () => {
    setErrorModalVisible(false);
    setErrorMessage('');
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
    // Navigation is handled automatically after 2 seconds
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start booking!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Country</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => {
                console.log('Opening country picker, countries:', commonCountries.length, 'available');
                console.log('Countries:', commonCountries.map(c => `${c.code} - ${c.name}`));
                setShowCountryPicker(!showCountryPicker);
              }}
            >
              <MaterialIcons name="public" size={20} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: country ? '#000' : '#999' }]}
                value={country ? commonCountries.find(c => c.code === country)?.name || country : ''}
                placeholder="Tap to select country"
                editable={false}
                pointerEvents="none"
              />
              <MaterialIcons 
                name={showCountryPicker ? "arrow-drop-up" : "arrow-drop-down"} 
                size={24} 
                color="rgba(76,188,113,0.7)" 
              />
            </TouchableOpacity>
            
            {/* Simple dropdown list */}
            {showCountryPicker && (
              <View style={styles.dropdownContainer}>
                <ScrollView 
                  style={styles.dropdownScrollView}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {commonCountries.map((countryItem) => (
                    <TouchableOpacity
                      key={countryItem.code}
                      style={[
                        styles.dropdownItem,
                        country === countryItem.code && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        console.log('Selecting country:', countryItem.code);
                        setCountry(countryItem.code);
                        setShowCountryPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        country === countryItem.code && styles.dropdownItemTextSelected
                      ]}>
                        {countryItem.code} - {countryItem.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {/* Scroll indicator */}
                  {commonCountries.length > 5 && (
                    <View style={styles.scrollIndicator}>
                      <Text style={styles.scrollIndicatorText}>Scroll for more countries</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            
            {country && (
              <Text style={styles.countryHint}>
                Selected: {commonCountries.find(c => c.code === country)?.name || country}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="rgba(76,188,113,0.7)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="rgba(76,188,113,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="rgba(76,188,113,0.7)" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>



      {/* Error Modal */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeErrorModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="error" size={48} color="#FF6B6B" />
            </View>
            <Text style={[styles.modalTitle, { color: '#FF6B6B' }]}>Signup Failed</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF6B6B' }]} onPress={closeErrorModal}>
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="check-circle" size={48} color="#4CBC71" />
            </View>
            <Text style={[styles.modalTitle, { color: '#4CBC71' }]}>Success!</Text>
            <Text style={styles.modalMessage}>Account created successfully!</Text>
            <Text style={[styles.modalMessage, { fontSize: 14, color: '#999' }]}>Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CBC71',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#4CBC71',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    color: '#4CBC71',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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

  countryHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },

  // Dropdown Styles
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,188,113,0.3)',
    marginTop: 8,
    maxHeight: 200,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 180,
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(76,188,113,0.1)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#4CBC71',
    fontWeight: '600',
  },
  scrollIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SignUpScreen; 