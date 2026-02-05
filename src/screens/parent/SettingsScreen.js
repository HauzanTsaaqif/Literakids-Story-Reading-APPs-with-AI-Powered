import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { authService, settingsService } from '../../services/firebaseService';
import ParentHeader from '../../components/ParentHeader';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      setCurrentUser(user);
      const userSettings = await settingsService.getSettings(user.uid);

      setSettings(
        userSettings || {
          fontSize: 'medium',
          autoPlay: false,
          soundEnabled: true,
        },
      );
    } catch (error) {
      console.error('Load Settings Error:', error);
      Alert.alert('Error', 'Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Save to Firestore
      await settingsService.updateSettings(currentUser.uid, newSettings);
    } catch (error) {
      console.error('Update Setting Error:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ParentHeader
        title="Pengaturan"
        subtitle="Sesuaikan Pembelajaran"
        onBackPress={() => navigation.goBack()}
        onAccountPress={() => navigation.navigate('DashboardScreen')}
        navigation={navigation}
      />
      <ScrollView style={styles.scrollContent}>
        {/* Ukuran Font */}
        <View style={styles.section}>
          <Image
            source={require('../../assets/images/icon/settings.png')}
            style={styles.settingsTitleIcon}
          />
          <Text style={styles.sectionDesc}>
            Pilih ukuran tulisan yang nyaman untuk anak
          </Text>

          <View style={styles.fontOptions}>
            <TouchableOpacity
              style={[
                styles.fontOption,
                settings.fontSize === 'small' && styles.fontOptionActive,
              ]}
              onPress={() => updateSetting('fontSize', 'small')}>
              <Text style={[styles.fontPreview, { fontSize: 16 }]}>Aa</Text>
              <Text
                style={[
                  styles.fontLabel,
                  settings.fontSize === 'small' && styles.fontLabelActive,
                ]}>
                Kecil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fontOption,
                settings.fontSize === 'medium' && styles.fontOptionActive,
              ]}
              onPress={() => updateSetting('fontSize', 'medium')}>
              <Text style={[styles.fontPreview, { fontSize: 20 }]}>Aa</Text>
              <Text
                style={[
                  styles.fontLabel,
                  settings.fontSize === 'medium' && styles.fontLabelActive,
                ]}>
                Sedang
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fontOption,
                settings.fontSize === 'large' && styles.fontOptionActive,
              ]}
              onPress={() => updateSetting('fontSize', 'large')}>
              <Text style={[styles.fontPreview, { fontSize: 24 }]}>Aa</Text>
              <Text
                style={[
                  styles.fontLabel,
                  settings.fontSize === 'large' && styles.fontLabelActive,
                ]}>
                Besar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fontPreviewBox}>
            <Text
              style={[
                styles.previewText,
                {
                  fontSize:
                    settings.fontSize === 'small'
                      ? 16
                      : settings.fontSize === 'large'
                        ? 24
                        : 20,
                },
              ]}>
              Ini contoh tulisan cerita yang akan dibaca anak. Pastikan ukuran
              nyaman dibaca!
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={[styles.section, { marginBottom: SPACING.xl }]}>
          <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versi Aplikasi</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>LiteraKids Team</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsTitleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionDesc: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  fontOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  fontOption: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  fontOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fontPreview: {
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  fontLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
  },
  fontLabelActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  fontPreviewBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  previewText: {
    color: COLORS.text,
    lineHeight: 28,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingDesc: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  tipsContainer: {
    backgroundColor: '#E5F5FF',
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 15,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tipsText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});

export default SettingsScreen;
