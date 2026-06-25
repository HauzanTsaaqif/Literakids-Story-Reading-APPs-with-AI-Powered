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
  Modal,
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

  // Date picker states
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate arrays for date picker
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '01', label: '01' },
    { value: '02', label: '02' },
    { value: '03', label: '03' },
    { value: '04', label: '04' },
    { value: '05', label: '05' },
    { value: '06', label: '06' },
    { value: '07', label: '07' },
    { value: '08', label: '08' },
    { value: '09', label: '09' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleDateConfirm = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      // Format: YYYY-MM-DD for consistent parsing
      const dateString = `${selectedYear}-${selectedMonth}-${selectedDay.toString().padStart(2, '0')}`;
      updateField('birthDate', dateString);
      setShowDatePicker(false);
    } else {
      Alert.alert('Error', 'Mohon pilih tanggal lengkap');
    }
  };

  const formatDateDisplay = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleRegister = async () => {
    // Validation
    if (Object.values(formData).some(val => !val)) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    // Email validation - check if contains @
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Format email tidak valid');
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
              <Text style={styles.label}>Tanggal Lahir Anak *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}>
                <Image
                  source={require('../../assets/images/icon/birtday_cake.png')}
                  style={styles.dateIcon}
                />
                <Text
                  style={[
                    styles.datePickerText,
                    !formData.birthDate && styles.datePickerPlaceholder,
                  ]}>
                  {formData.birthDate
                    ? formatDateDisplay(formData.birthDate)
                    : 'Pilih tanggal lahir anak'}
                </Text>
              </TouchableOpacity>
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

      {/* Custom Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Image
                source={require('../../assets/images/icon/birtday_cake.png')}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>Pilih Tanggal Lahir Anak</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Tanggal</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}>
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemActive,
                      ]}
                      onPress={() => setSelectedDay(day)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.pickerItemTextActive,
                        ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Bulan</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}>
                  {months.map(month => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month.value &&
                          styles.pickerItemActive,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month.value &&
                            styles.pickerItemTextActive,
                        ]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Tahun</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemActive,
                      ]}
                      onPress={() => setSelectedYear(year)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.pickerItemTextActive,
                        ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDateConfirm}>
              <Text style={styles.confirmButtonText}>Konfirmasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Date Picker Styles
  datePickerButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dateIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.sm,
    resizeMode: 'contain',
  },
  datePickerText: {
    fontSize: Math.min(SCREEN_WIDTH * 0.038, 15),
    color: '#212121',
    flex: 1,
  },
  datePickerPlaceholder: {
    color: '#9E9E9E',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#E91E63',
    fontWeight: FONTS.weights.bold,
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  pickerScroll: {
    maxHeight: 180,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  pickerItemActive: {
    backgroundColor: '#E91E63',
  },
  pickerItemText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },
  pickerItemTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.5,
  },
});

export default RegisterScreen;
