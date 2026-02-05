import React, { useState, useEffect } from 'react';
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
  Modal,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { authService } from '../../services/firebaseService';
import { CommonActions } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [parentData, setParentData] = useState(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardPassword, setDashboardPassword] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const user = authService.getCurrentUser();
    if (user) {
      try {
        const profile = await authService.getParentProfile(user.uid);
        setParentData(profile);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    setLoading(true);
    try {
      await authService.login(emailOrUsername, password);
      await checkLoginStatus();
      const rootNavigation = navigation.getParent() || navigation;

      Alert.alert('Berhasil', 'Login berhasil!', [
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
      Alert.alert('Login Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            setIsLoggedIn(false);
            setParentData(null);
            setEmailOrUsername('');
            setPassword('');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const handleDashboard = () => {
    setShowDashboardModal(true);
    setDashboardPassword('');
  };

  const handleVerifyDashboard = async () => {
    if (!dashboardPassword) {
      Alert.alert('Error', 'Mohon masukkan password');
      return;
    }

    setVerifyingPassword(true);
    try {
      const user = authService.getCurrentUser();
      if (user && parentData) {
        // Verify password by attempting to re-authenticate
        await authService.login(parentData.email, dashboardPassword);
        setShowDashboardModal(false);
        setDashboardPassword('');
        // Navigate to DashboardScreen
        navigation.navigate('ParentAdmin');
      }
    } catch (error) {
      Alert.alert('Verifikasi Gagal', 'Password salah! Silakan coba lagi.');
      setDashboardPassword('');
    } finally {
      setVerifyingPassword(false);
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
          {isLoggedIn && parentData ? (
            // Parent Profile Card - Displayed when logged in
            <ParentProfileCardView
              parentData={parentData}
              onLogout={handleLogout}
              onDashboard={handleDashboard}
              navigation={navigation}
            />
          ) : (
            // Login Form - Displayed when not logged in
            <>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require('../../assets/images/icon/orangtua.png')}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.title}>Login Orang Tua</Text>
                <Text style={styles.subtitle}>
                  Masuk untuk mengelola konten dan memantau perkembangan anak
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email atau Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan email atau username"
                    value={emailOrUsername}
                    onChangeText={setEmailOrUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.loginButtonText}>Masuk</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerButtonText}>
                    Daftar Akun Baru
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.backButtonText}>
                    ← Kembali ke Ruang Baca
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        {/* Dashboard Verification Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDashboardModal}
          onRequestClose={() => setShowDashboardModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Image
                  source={require('../../assets/images/icon/lock.png')}
                  style={styles.modalLockIcon}
                />
                <Text style={styles.modalTitle}>Verifikasi Password</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowDashboardModal(false)}>
                  <Image
                    source={require('../../assets/images/icon/reject.png')}
                    style={styles.modalLockIcon}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Masukkan password untuk mengakses Dashboard
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Password"
                value={dashboardPassword}
                onChangeText={setDashboardPassword}
                secureTextEntry
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  verifyingPassword && styles.modalButtonDisabled,
                ]}
                onPress={handleVerifyDashboard}
                disabled={verifyingPassword}>
                {verifyingPassword ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.modalButtonText}>
                    Verifikasi & Buka Dashboard
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

// Parent Profile Card Component
const ParentProfileCardView = ({
  parentData,
  onLogout,
  onDashboard,
  navigation,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getGenderEmoji = gender => {
    if (gender === 'male') return '👨';
    if (gender === 'female') return '👩';
    return '👤';
  };

  return (
    <View style={styles.profileContainer}>
      {/* Main Profile Card */}
      <View style={styles.profileCard}>
        {/* Header with Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Image
                source={require('../../assets/images/icon/orangtua.png')}
                style={styles.avatarImage}
              />
              <View style={styles.avatarBadge}>
                <Image
                  source={require('../../assets/images/icon/star_bright.png')}
                  style={styles.avatarBadgeIcon}
                />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileGreeting}>{getGreeting()}!</Text>
              <Text style={styles.profileName}>{parentData.username}</Text>
              <Text style={styles.profileEmail}>{parentData.email}</Text>
            </View>
          </View>
        </View>

        {/* Colorful Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#FFE5CC' }]}>
            <Image
              source={require('../../assets/images/icon/kids.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Usia Anak</Text>
            <Text style={styles.statValue}>{parentData.childAge} tahun</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E5F3FF' }]}>
            <Image
              source={require('../../assets/images/icon/birtday_cake.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Tanggal Lahir</Text>
            <Text style={styles.statValue}>
              {new Date(parentData.birthDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>

        {/* Dashboard Button - Single Big Button */}
        <TouchableOpacity
          style={styles.dashboardButtonLarge}
          onPress={onDashboard}>
          <Image
            source={require('../../assets/images/icon/chart.png')}
            style={styles.dashboardButtonIcon}
          />
          <Text style={styles.dashboardButtonText}>
            Buka Dashboard Orang Tua
          </Text>

          <Text style={styles.dashboardButtonSubtext}>
            Verifikasi password diperlukan
          </Text>
        </TouchableOpacity>

        {/* Settings Card with Cute Design */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Image
              source={require('../../assets/images/icon/settings.png')}
              style={styles.settingsTitleIcon}
            />
            <Text style={styles.settingsTitle}>Pengaturan Aktif</Text>
          </View>

          <View style={styles.settingsGrid}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Image
                  source={require('../../assets/images/icon/font.png')}
                  style={styles.settingIconImage}
                />
              </View>
              <Text style={styles.settingLabel}>Font</Text>
              <View style={styles.settingBadge}>
                <Text style={styles.settingBadgeText}>
                  {parentData.settings?.fontSize === 'large'
                    ? 'Besar'
                    : parentData.settings?.fontSize === 'small'
                      ? 'Kecil'
                      : 'Sedang'}
                </Text>
              </View>
            </View>

            {/* <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Image
                  source={require('../../assets/images/icon/play.png')}
                  style={styles.settingIconImage}
                />
              </View>
              <Text style={styles.settingLabel}>Auto Play</Text>
              <View
                style={[
                  styles.settingBadge,
                  parentData.settings?.autoPlay && styles.settingBadgeActive,
                ]}>
                <Text style={styles.settingBadgeText}>
                  {parentData.settings?.autoPlay ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View> */}

            {/* <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Image
                  source={require('../../assets/images/icon/sound.png')}
                  style={styles.settingIconImage}
                />
              </View>
              <Text style={styles.settingLabel}>Suara</Text>
              <View
                style={[
                  styles.settingBadge,
                  parentData.settings?.soundEnabled &&
                    styles.settingBadgeActive,
                ]}>
                <Text style={styles.settingBadgeText}>
                  {parentData.settings?.soundEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View> */}
          </View>
        </View>

        {/* Fun Footer */}
        <View style={styles.profileFooter}>
          <Image
            source={require('../../assets/images/icon/star_bright.png')}
            style={styles.footerIcon}
          />
          <Text style={styles.footerText}>
            Terus dampingi pembelajaran anak!
          </Text>
          <Image
            source={require('../../assets/images/icon/star_bright.png')}
            style={styles.footerIcon}
          />
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButtonProfile}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonProfileText}>
          ← Kembali ke Ruang Baca
        </Text>
      </TouchableOpacity>
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
    height: SCREEN_HEIGHT * 0.38,
    zIndex: 0,
  },
  headerBackgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.38,
    opacity: 0.95,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SCREEN_HEIGHT * 0.28,
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
    fontSize: Math.min(SCREEN_WIDTH * 0.07, 30),
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
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 15),
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
    fontSize: Math.min(SCREEN_WIDTH * 0.038, 15),
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
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
    color: '#212121',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: Math.min(SCREEN_WIDTH * 0.045, 18),
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: SPACING.lg,
    color: '#9E9E9E',
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    fontWeight: FONTS.weights.medium,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E91E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  registerButtonText: {
    color: '#E91E63',
    fontSize: Math.min(SCREEN_WIDTH * 0.042, 17),
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButtonText: {
    color: '#757575',
    fontSize: Math.min(SCREEN_WIDTH * 0.038, 15),
    fontWeight: FONTS.weights.semibold,
  },
  // Profile Card Styles
  profileContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  profileHeader: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: Math.min(SCREEN_WIDTH * 0.16, 70),
    height: Math.min(SCREEN_WIDTH * 0.16, 70),
    borderRadius: Math.min(SCREEN_WIDTH * 0.08, 35),
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  avatarImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  avatarEmoji: {
    fontSize: 45,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarBadgeIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  avatarBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: FONTS.weights.heavy,
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  profileName: {
    fontSize: Math.min(SCREEN_WIDTH * 0.055, 22),
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  profileEmail: {
    fontSize: FONTS.sizes.tiny,
    color: COLORS.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
    gap: Math.min(SCREEN_WIDTH * 0.025, 10),
    justifyContent: 'space-between',
  },
  statCard: {
    width: `${(100 - 4) / 1}%`,
    minWidth: Math.min(SCREEN_WIDTH * 0.3, 100),
    maxWidth: Math.min(SCREEN_WIDTH * 0.32, 120),
    borderRadius: 16,
    padding: Math.min(SCREEN_WIDTH * 0.035, 14),
    paddingVertical: Math.min(SCREEN_WIDTH * 0.04, 16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: Math.min(SCREEN_WIDTH * 0.3, 32),
    height: Math.min(SCREEN_WIDTH * 0.3, 32),
    resizeMode: 'contain',
    marginBottom: Math.min(SCREEN_WIDTH * 0.015, 6),
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.tiny,
    color: '#757575',
    marginBottom: 3,
    textAlign: 'center',
    fontWeight: FONTS.weights.medium,
  },
  statValue: {
    fontSize: FONTS.sizes.tiny + 2,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    textAlign: 'center',
    lineHeight: Math.min(SCREEN_WIDTH * 0.04, 16),
    flexWrap: 'wrap',
    marginqTop: 4,
  },
  dashboardButtonLarge: {
    backgroundColor: '#E91E63',
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dashboardButtonIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
    marginBottom: SPACING.xs,
  },
  dashboardButtonEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  dashboardButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  dashboardButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONTS.sizes.tiny,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsHeader: {
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  settingsTitleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  settingsTitle: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    textAlign: 'center',
  },
  settingsGrid: {
    gap: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  settingIconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  settingIconText: {
    fontSize: 20,
  },
  settingLabel: {
    flex: 1,
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  settingBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
  },
  settingBadgeActive: {
    backgroundColor: '#4CAF50',
  },
  settingBadgeText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  footerIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginHorizontal: SPACING.xs,
  },
  footerEmoji: {
    fontSize: 20,
    marginHorizontal: SPACING.xs,
  },
  footerText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  backButtonProfile: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButtonProfileText: {
    color: '#757575',
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
    fontWeight: FONTS.weights.semibold,
  },
  // Dashboard Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: Math.min(SCREEN_WIDTH * 0.96, 450),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  modalLockIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  modalCloseButton: {
    width: 38,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: FONTS.weights.bold,
  },
  modalSubtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
    color: '#212121',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: '#E91E63',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
  },
});

export default LoginScreen;
