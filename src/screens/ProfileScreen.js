import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { authService, parentProfileService } from '../services/firebaseService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const starScale = useSharedValue(1);

  useEffect(() => {
    // Star animation
    starScale.value = withRepeat(
      withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      false
    );
    
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await parentProfileService.getParentProfile(currentUser.uid);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Load Profile Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Gagal keluar dari akun');
            }
          },
        },
      ]
    );
  };

  const starAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: starScale.value }],
    };
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </View>
    );
  }

  if (!user) {
    // Not logged in - show login prompt
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </View>
          <Text style={styles.name}>Belum Login</Text>
          <Text style={styles.level}>Mari bergabung! ✨</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Untuk Orang Tua 👨‍👩‍👧</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Parent', { screen: 'Login' })}>
            <Text style={styles.loginButtonText}>🚀 Login / Daftar Orang Tua</Text>
          </TouchableOpacity>
          
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Keuntungan Login:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Tambah buku sendiri</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Lihat progress anak</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Atur preferensi belajar</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Simpan pencapaian</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lainnya ℹ️</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuText}>Tentang Aplikasi</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>📧</Text>
            <Text style={styles.menuText}>Hubungi Kami</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  }

  // Logged in - show profile details
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.gender === 'male' ? '👨' : profile?.gender === 'female' ? '👩' : '👤'}
            </Text>
          </View>
          <Animated.View style={[styles.verifiedBadge, starAnimatedStyle]}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </Animated.View>
        </View>
        <Text style={styles.name}>{profile?.username || 'Pengguna'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>🌟 Orang Tua Terverifikasi</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>📋 Informasi Akun</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{profile?.username || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Jenis Kelamin</Text>
              <Text style={styles.infoValue}>
                {profile?.gender === 'male' ? 'Laki-laki' : profile?.gender === 'female' ? 'Perempuan' : '-'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tanggal Lahir</Text>
              <Text style={styles.infoValue}>{profile?.birthDate || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Usia Anak</Text>
              <Text style={styles.infoValue}>{profile?.childAge ? `${profile.childAge} tahun` : '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Pengaturan</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>📖</Text>
          <Text style={styles.menuText}>Ukuran Font</Text>
          <Text style={styles.menuValue}>{profile?.settings?.fontSize || 'Sedang'}</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>🔊</Text>
          <Text style={styles.menuText}>Suara</Text>
          <Text style={styles.menuValue}>{profile?.settings?.soundEnabled ? 'Aktif' : 'Nonaktif'}</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>▶️</Text>
          <Text style={styles.menuText}>Auto Play</Text>
          <Text style={styles.menuValue}>{profile?.settings?.autoPlay ? 'Aktif' : 'Nonaktif'}</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍👩‍👧 Menu Orang Tua</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Parent', { screen: 'Dashboard' })}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Dashboard Orang Tua</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Parent', { screen: 'BookList' })}>
          <Text style={styles.menuIcon}>📚</Text>
          <Text style={styles.menuText}>Kelola Buku</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Parent', { screen: 'Settings' })}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Pengaturan Lengkap</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Lainnya</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>Tentang Aplikasi</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>📧</Text>
          <Text style={styles.menuText}>Hubungi Kami</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuText}>Beri Rating</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Keluar Akun</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.large,
    color: COLORS.textLight,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  avatarText: {
    fontSize: 60,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONTS.weights.heavy,
  },
  name: {
    fontSize: FONTS.sizes.xxlarge,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  level: {
    fontSize: FONTS.sizes.large,
    color: COLORS.white,
  },
  statusBadge: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.semibold,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 15,
    marginBottom: SPACING.sm,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  menuIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  menuValue: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
    marginRight: SPACING.sm,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.3)',
      },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  loginButtonText: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  benefitsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  benefitsTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  benefitText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: SPACING.lg,
    borderRadius: 20,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(255, 107, 107, 0.3)',
      },
      default: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  logoutButtonText: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});

export default ProfileScreen;
