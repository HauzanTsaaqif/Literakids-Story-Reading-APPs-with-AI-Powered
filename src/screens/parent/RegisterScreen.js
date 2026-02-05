import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { authService } from '../../services/firebaseService';
import { CommonActions } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    gender: '',
    birthDate: '',
    childAge: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (Object.values(formData).some(val => !val)) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData.email, formData.password, {
        email: formData.email,
        username: formData.username,
        gender: formData.gender,
        birthDate: formData.birthDate,
        childAge: formData.childAge,
      });
      const rootNavigation = navigation.getParent() || navigation;

      Alert.alert('Berhasil', 'Akun berhasil dibuat', [
        {
          text: 'OK',
          onPress: () =>
            rootNavigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              }),
            ),
        },
      ]);
    } catch (error) {
      Alert.alert('Registrasi Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Layer - Header */}
      <ImageBackground
        source={require('../../assets/images/mascot/header_login.jpg')}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/icon/orangtua.png')}
                style={styles.headerIcon}
              />
            </View>
            <Text style={styles.title}>Daftar Akun Orang Tua</Text>
            <Text style={styles.subtitle}>
              Buat akun untuk mengelola pembelajaran anak
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="contoh@email.com"
                value={formData.email}
                onChangeText={val => updateField('email', val)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="Username unik"
                value={formData.username}
                onChangeText={val => updateField('username', val)}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Jenis Kelamin *</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'Laki-laki' &&
                      styles.genderButtonActive,
                  ]}
                  onPress={() => updateField('gender', 'Laki-laki')}>
                  <Text
                    style={[
                      styles.genderText,
                      formData.gender === 'Laki-laki' &&
                        styles.genderTextActive,
                    ]}>
                    Laki-laki
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'Perempuan' &&
                      styles.genderButtonActive,
                  ]}
                  onPress={() => updateField('gender', 'Perempuan')}>
                  <Text
                    style={[
                      styles.genderText,
                      formData.gender === 'Perempuan' &&
                        styles.genderTextActive,
                    ]}>
                    Perempuan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tanggal Lahir *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={formData.birthDate}
                onChangeText={val => updateField('birthDate', val)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Usia Anak *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 3-6 tahun"
                value={formData.childAge}
                onChangeText={val => updateField('childAge', val)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChangeText={val => updateField('password', val)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Konfirmasi Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ketik ulang password"
                value={formData.confirmPassword}
                onChangeText={val => updateField('confirmPassword', val)}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>
                ← Sudah punya akun? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.25,
    zIndex: 0,
  },
  headerBackgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.25,
    opacity: 0.95,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SCREEN_HEIGHT * 0.22,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: Math.min(SCREEN_WIDTH * 0.22, 90),
    height: Math.min(SCREEN_WIDTH * 0.22, 90),
    borderRadius: Math.min(SCREEN_WIDTH * 0.11, 45),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerIcon: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: Math.min(SCREEN_WIDTH * 0.06, 30),
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: SPACING.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Math.min(SCREEN_WIDTH * 0.03, 15),
    color: '#616161',
    textAlign: 'center',
    fontWeight: FONTS.weights.medium,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    fontWeight: FONTS.weights.bold,
    color: '#424242',
    marginBottom: SPACING.xs,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    fontSize: Math.min(SCREEN_WIDTH * 0.038, 15),
    color: '#212121',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  genderButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  genderText: {
    fontSize: Math.min(SCREEN_WIDTH * 0.038, 15),
    color: '#616161',
    fontWeight: FONTS.weights.semibold,
  },
  genderTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  registerButton: {
    backgroundColor: '#E91E63',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: Math.min(SCREEN_WIDTH * 0.045, 18),
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.8,
  },
  backButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButtonText: {
    color: '#757575',
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    fontWeight: FONTS.weights.semibold,
  },
});

export default RegisterScreen;
