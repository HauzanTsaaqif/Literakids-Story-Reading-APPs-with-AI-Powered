import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { FONTS, SPACING } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/firebaseService';
import { CommonActions } from '@react-navigation/native';

const ParentHeader = ({
  title,
  subtitle,
  onBackPress,
  onAccountPress,
  navigation,
  showBackButton = true,
  showAccountButton = true,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      if (!navigation) {
        Alert.alert('Error', 'Navigation tidak tersedia');
        return;
      }

      // Sign out from Firebase Auth
      await authService.logout();

      // Clear all local storage data
      await AsyncStorage.clear();

      // Navigate to HomeScreen (Main screen with child tabs) - do this BEFORE closing modal
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );

      // Close modal after navigation
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
      setShowLogoutModal(false);
    }
  };

  const handleAccountPress = () => {
    setShowLogoutModal(true);
  };

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Image
            source={require('../assets/images/icon/left_arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>

      {showAccountButton ? (
        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleAccountPress}>
          <Image
            source={require('../assets/images/icon/orangtua.png')}
            style={styles.accountIcon}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require('../assets/images/icon/orangtua.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Konfirmasi Logout</Text>
            <Text style={styles.modalMessage}>
              Apakah Anda yakin ingin keluar dari akun?
            </Text>
            <Text style={styles.modalWarning}>
              Semua data lokal akan dihapus.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}>
                <Text style={styles.confirmButtonText}>Ya, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.small,
    color: '#757575',
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  accountButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  accountIcon: {
    width: 38,
    height: 38,
  },
  spacer: {
    width: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIcon: {
    width: 80,
    height: 80,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: FONTS.sizes.medium,
    color: '#424242',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  modalWarning: {
    fontSize: FONTS.sizes.small,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: FONTS.weights.medium,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: '#757575',
  },
  confirmButton: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: '#FFFFFF',
  },
});

export default ParentHeader;
