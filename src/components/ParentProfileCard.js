import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const ParentProfileCard = ({ parentData, onManageContent, onViewDashboard, onLogout }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getGenderEmoji = (gender) => {
    if (gender === 'male') return '👨';
    if (gender === 'female') return '👩';
    return '👤';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>
                {getGenderEmoji(parentData.gender)}
              </Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
              <Text style={styles.username}>{parentData.username}</Text>
              <Text style={styles.email}>{parentData.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>👶</Text>
            <Text style={styles.infoLabel}>Usia Anak</Text>
            <Text style={styles.infoValue}>{parentData.childAge} tahun</Text>
          </View>
          
          <View style={[styles.infoCard, styles.infoCardMiddle]}>
            <Text style={styles.infoIcon}>🎂</Text>
            <Text style={styles.infoLabel}>Tanggal Lahir</Text>
            <Text style={styles.infoValue}>
              {new Date(parentData.birthDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📚</Text>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>Aktif</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={onManageContent}>
            <Text style={styles.actionIcon}>📖</Text>
            <Text style={styles.actionButtonText}>Kelola Konten</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={onViewDashboard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionButtonTextSecondary}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Info */}
        <View style={styles.settingsInfo}>
          <Text style={styles.settingsTitle}>⚙️ Pengaturan Saat Ini:</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Ukuran Font:</Text>
              <Text style={styles.settingValue}>
                {parentData.settings?.fontSize === 'large' ? 'Besar' :
                 parentData.settings?.fontSize === 'small' ? 'Kecil' : 'Sedang'}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto Play:</Text>
              <Text style={styles.settingValue}>
                {parentData.settings?.autoPlay ? 'Aktif ✅' : 'Nonaktif ❌'}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Suara:</Text>
              <Text style={styles.settingValue}>
                {parentData.settings?.soundEnabled ? 'Aktif 🔊' : 'Nonaktif 🔇'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFE5CC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: '#FFF8F0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  infoSection: {
    flex: 1,
  },
  greeting: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  username: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    marginBottom: 2,
  },
  email: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
  },
  logoutButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFE5CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  logoutIcon: {
    fontSize: 22,
  },
  infoCards: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    borderRadius: 15,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE5CC',
  },
  infoCardMiddle: {
    marginHorizontal: SPACING.xs,
  },
  infoIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONTS.sizes.tiny,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.xs,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
  },
  actionButtonTextSecondary: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
  },
  settingsInfo: {
    backgroundColor: '#FFF8F0',
    borderRadius: 15,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: '#FFE5CC',
  },
  settingsTitle: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  settingsList: {
    gap: SPACING.xs,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  settingLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
  },
  settingValue: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
});

export default ParentProfileCard;
