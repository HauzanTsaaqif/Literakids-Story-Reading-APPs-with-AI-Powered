import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { CommonActions } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import ParentHeader from '../../components/ParentHeader';
import { getCurrentBaseUrl } from '../../services/api';
import { authService, booksService } from '../../services/firebaseService';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const StorySettingsScreen = ({ route, navigation }) => {
  const {
    storyData,
    storageKey,
    themeData,
    moralData,
    editMode,
    bookId,
    audioUrl: existingAudioUrl,
    audioDuration: existingAudioDuration,
  } = route.params || {};

  const [storyTitle, setStoryTitle] = useState(storyData?.judul || '');
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(existingAudioUrl || null);
  const [audioDuration, setAudioDuration] = useState(
    existingAudioDuration || null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const soundRef = useRef(null);
  const progressInterval = useRef(null);

  const handleDeleteBook = async () => {
    setShowDeleteModal(false);
    setDeleting(true);

    try {
      if (!bookId) {
        throw new Error('Book ID tidak ditemukan');
      }

      await booksService.deleteMasterBookWithRelations(bookId);

      Alert.alert('Berhasil', 'Buku berhasil dihapus dari database', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Delete Book Error:', error);
      Alert.alert('Error', 'Gagal menghapus buku: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateAudio = async () => {
    setShowConfirmModal(false);
    setGeneratingAudio(true);

    try {
      const fullStory = storyData?.full_story || '';
      if (!fullStory) {
        Alert.alert('Error', 'Cerita tidak ditemukan');
        return;
      }
      const baseUrl = await getCurrentBaseUrl();

      const apiUrl = `${baseUrl}/generate-speech`;
      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullStory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      setAudioUrl(data.audio_url);
      setAudioDuration(data.duration);
      Alert.alert('Berhasil', 'Audio cerita berhasil dibuat!');
    } catch (error) {
      console.error('Generate Audio Error:', error);
      Alert.alert('Error', 'Gagal membuat audio: ' + error.message);
    } finally {
      setGeneratingAudio(false);
    }
  };

  const loadAudio = async () => {
    if (!audioUrl) return;

    try {
      // Unload existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;
      setAudioLoaded(true);
      console.log('Audio loaded successfully');
    } catch (error) {
      console.error('Failed to load audio', error);
      // Temporary: set as loaded anyway to allow UI interaction
      setAudioLoaded(true);
      Alert.alert(
        'Info',
        'Fitur audio akan tersedia setelah rebuild aplikasi. Untuk sementara gunakan link audio langsung.',
      );
    }
  };

  const onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setCurrentTime(0);
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!soundRef.current || !audioLoaded) {
      // Open audio URL in browser as fallback
      if (audioUrl) {
        Alert.alert(
          'Buka Audio',
          'Audio player akan tersedia setelah rebuild. Buka link audio di browser?',
          [
            { text: 'Batal', style: 'cancel' },
            {
              text: 'Buka',
              onPress: () => {
                // This will be handled by the system
                console.log('Open audio URL:', audioUrl);
              },
            },
          ],
        );
      } else {
        Alert.alert('Error', 'Audio belum siap diputar');
      }
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();

      if (status.isPlaying) {
        // Pause
        await soundRef.current.pauseAsync();
      } else {
        // Play
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert(
        'Info',
        'Fitur audio player akan tersedia setelah rebuild aplikasi',
      );
    }
  };

  const handleSaveToFirebase = async () => {
    if (!storyTitle.trim()) {
      Alert.alert('Perhatian', 'Judul cerita tidak boleh kosong');
      return;
    }

    setSaving(true);

    try {
      const rootNavigation = navigation.getParent() || navigation;

      const user = authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Sesi berakhir, silakan login kembali');
        navigation.replace('Login');
        return;
      }

      const firestore = getFirestore();

      // Convert cerita array to content array
      const contentArray = Array.isArray(storyData.cerita)
        ? storyData.cerita
        : Object.values(storyData.cerita || {});

      // Convert images object to array format for Firebase
      const imagesArray = storyData.images
        ? Object.values(storyData.images)
        : [];

      const bookData = {
        title: storyTitle,
        content: contentArray,
        images: imagesArray,
        genre: themeData?.id || themeData?.name || 'petualangan',
        moralValue: moralData?.label || moralData?.name || '',
        coverEmoji: '📖',
        ageRange: '6-9',
        estimatedDuration: Math.ceil(contentArray.length * 1.5),
        isGlobal: false,
        parentId: user.uid,
        audioUrl: audioUrl || null,
        audioDuration: audioDuration || null,
      };

      if (editMode && bookId) {
        // Update existing book
        await updateDoc(doc(firestore, 'masterBooks', bookId), {
          ...bookData,
          updatedAt: serverTimestamp(),
        });
        console.log('Book updated in masterBooks:', bookId);

        Alert.alert('Berhasil!', 'Perubahan cerita berhasil disimpan');

        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'ParentAdmin',
                // Provide nested state so the ParentAdmin tab navigator opens on BookList
                state: {
                  index: 0,
                  routes: [{ name: 'BookList' }],
                },
              },
            ],
          }),
        );
      } else {
        // Create new book
        const newBookId = `custom_${Date.now()}`;
        await setDoc(doc(firestore, 'masterBooks', newBookId), {
          ...bookData,
          createdAt: serverTimestamp(),
        });
        console.log('Book saved to masterBooks:', newBookId);

        // Save to parentBooks
        const parentBookId = `${user.uid}_${newBookId}`;
        const parentBookData = {
          parentId: user.uid,
          masterBookId: newBookId,
          addedAt: serverTimestamp(),
        };

        await setDoc(
          doc(firestore, 'parentBooks', parentBookId),
          parentBookData,
        );
        console.log('Book linked to parentBooks:', parentBookId);

        Alert.alert(
          'Berhasil!',
          'Cerita berhasil disimpan dan dapat dilihat di daftar buku',
        );

        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'ParentAdmin',
                // Provide nested state so the ParentAdmin tab navigator opens on BookList
                state: {
                  index: 0,
                  routes: [{ name: 'BookList' }],
                },
              },
            ],
          }),
        );
      }
    } catch (error) {
      console.error('Save to Firebase Error:', error);
      Alert.alert('Error', 'Gagal menyimpan ke database: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = seconds => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Load audio when URL changes
  useEffect(() => {
    if (audioUrl) {
      loadAudio();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Decorations */}
      <ImageBackground
        source={require('../../assets/images/mascot/header_readerpage.jpg')}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      />
      <ImageBackground
        source={require('../../assets/images/mascot/footer_readerpage.jpg')}
        style={styles.footerBackground}
        imageStyle={styles.footerBackgroundImage}
      />

      <ParentHeader
        title="Pengaturan Cerita"
        subtitle="Atur judul dan suara"
        onBackPress={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Title Editor Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/icon/book.png')}
              style={styles.sectionIconImage}
            />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Judul Cerita</Text>
              <Text style={styles.sectionSubtitle}>
                Buat judul yang menarik
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.titleInput}
            value={storyTitle}
            onChangeText={setStoryTitle}
            placeholder="Masukkan judul cerita..."
            placeholderTextColor="#BDBDBD"
            maxLength={100}
          />
          <Text style={styles.characterCount}>{storyTitle.length}/100</Text>
        </View>

        {/* Audio Generation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/icon/mic.png')}
              style={styles.sectionIconImage}
            />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Suara Cerita</Text>
              <Text style={styles.sectionSubtitle}>
                Generate audio narasi otomatis
              </Text>
            </View>
          </View>

          {!audioUrl ? (
            <TouchableOpacity
              style={[
                styles.generateAudioButton,
                generatingAudio && styles.generateAudioButtonDisabled,
              ]}
              onPress={() => setShowConfirmModal(true)}
              disabled={generatingAudio}>
              {generatingAudio ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Image
                    source={require('../../assets/images/icon/sound.png')}
                    style={styles.generateAudioIconImage}
                  />
                  <Text style={styles.generateAudioText}>Generate Suara</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.audioPlayerContainer}>
              <View style={styles.audioPlayerHeader}>
                <Text style={styles.audioPlayerTitle}>Audio Cerita</Text>
                <Text style={styles.audioPlayerDuration}>
                  {formatDuration(audioDuration)}
                </Text>
              </View>

              <View style={styles.audioControls}>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={handlePlayPause}
                  disabled={!audioLoaded}>
                  <Image
                    source={
                      isPlaying
                        ? require('../../assets/images/icon/pause.png')
                        : require('../../assets/images/icon/play.png')
                    }
                    style={styles.playPauseIconImage}
                  />
                </TouchableOpacity>

                <View style={styles.audioProgressBar}>
                  <View
                    style={[
                      styles.audioProgressFill,
                      { width: `${(currentTime / audioDuration) * 100}%` },
                    ]}
                  />
                </View>

                <Text style={styles.audioTimer}>
                  {formatDuration(currentTime)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={() => setShowConfirmModal(true)}>
                <Image
                  source={require('../../assets/images/icon/recycle.png')}
                  style={styles.regenerateButtonIcon}
                />
                <Text style={styles.regenerateButtonText}>Generate Ulang</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preview Info */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeaderRow}>
            <Image
              source={require('../../assets/images/icon/books.png')}
              style={styles.previewIcon}
            />
            <Text style={styles.previewTitle}>Info Cerita</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Tema:</Text>
            <Text style={styles.previewValue}>{themeData?.label || '-'}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Nilai Moral:</Text>
            <Text style={styles.previewValue}>{moralData?.label || '-'}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Jumlah Halaman:</Text>
            <Text style={styles.previewValue}>
              {Array.isArray(storyData?.cerita)
                ? storyData.cerita.length
                : Object.keys(storyData?.cerita || {}).length}{' '}
              halaman
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        {editMode && bookId && (
          <TouchableOpacity
            style={[
              styles.deleteBookButton,
              deleting && styles.saveButtonDisabled,
            ]}
            onPress={() => setShowDeleteModal(true)}
            disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Image
                  source={require('../../assets/images/icon/reject.png')}
                  style={styles.deleteBookIcon}
                />
                <Text style={styles.deleteBookText}>Hapus</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.saveButton,
            editMode && bookId && styles.saveButtonSmall,
            (!storyTitle.trim() || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveToFirebase}
          disabled={!storyTitle.trim() || saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Image
                source={require('../../assets/images/icon/save.png')}
                style={styles.saveButtonIcon}
              />
              <Text style={styles.saveButtonText}>
                {editMode ? 'Update' : 'Simpan'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../assets/images/icon/mic.png')}
              style={styles.modalIconImage}
            />
            <Text style={styles.modalTitle}>Generate Audio Cerita?</Text>
            <Text style={styles.modalMessage}>
              Audio akan dibuat menggunakan AI voice. Proses ini mungkin memakan
              waktu beberapa menit.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.modalButtonTextCancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleGenerateAudio}>
                <Text style={styles.modalButtonTextConfirm}>Ya, Generate!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../assets/images/icon/reject.png')}
              style={styles.modalIconImage}
            />
            <Text style={styles.modalTitle}>Hapus Buku</Text>
            <Text style={styles.modalMessage}>
              Apakah Anda yakin ingin menghapus buku ini?
            </Text>
            <Text
              style={[
                styles.modalMessage,
                { color: '#E91E63', fontWeight: 'bold', marginTop: 8 },
              ]}>
              Buku akan dihapus dari database dan semua relasi akan terhapus.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalButtonTextCancel}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleDeleteBook}>
                <Text style={styles.modalButtonTextConfirm}>Ya, Hapus</Text>
              </TouchableOpacity>
            </View>
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
    right: 0,
    height: 300,
    zIndex: 0,
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  footerBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 0,
  },
  footerBackgroundImage: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 20,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionIcon: {
    fontSize: 40,
    marginRight: SPACING.sm,
  },
  sectionIconImage: {
    width: 40,
    height: 40,
    marginRight: SPACING.sm,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.small - 1,
    color: '#757575',
    fontWeight: FONTS.weights.medium,
  },
  titleInput: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.semibold,
    color: '#212121',
    borderWidth: 2,
    borderColor: '#E91E63',
    borderStyle: 'dashed',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.tiny,
    color: '#9E9E9E',
  },
  generateAudioButton: {
    backgroundColor: '#E91E63',
    paddingVertical: SPACING.lg + 2,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  generateAudioButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateAudioIconImage: {
    width: 24,
    height: 24,
  },
  generateAudioText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
  },
  audioPlayerContainer: {
    backgroundColor: '#F8F0FF',
    borderRadius: 20,
    padding: SPACING.lg + 4,
    borderWidth: 3,
    borderColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  audioPlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  audioPlayerTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: '#212121',
  },
  audioPlayerDuration: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.semibold,
    color: '#E91E63',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  playPauseIconImage: {
    width: 24,
    height: 24,
  },
  audioProgressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  audioProgressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  audioTimer: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.medium,
    color: '#757575',
    minWidth: 40,
    textAlign: 'right',
  },
  regenerateButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 2,
    borderColor: '#E91E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  regenerateButtonIcon: {
    width: 20,
    height: 20,
  },
  regenerateButtonText: {
    color: '#E91E63',
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.semibold,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 3,
    borderColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: '#F5F5F5',
  },
  previewIcon: {
    width: 32,
    height: 32,
    marginRight: SPACING.sm,
  },
  previewTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#E91E63',
    letterSpacing: 0.3,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },
  previewLabel: {
    fontSize: FONTS.sizes.medium,
    color: '#616161',
    fontWeight: FONTS.weights.bold,
  },
  previewValue: {
    fontSize: FONTS.sizes.medium,
    color: '#E91E63',
    fontWeight: FONTS.weights.heavy,
  },
  bottomSpacing: {
    height: SPACING.xxl * 2,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    borderTopWidth: 2,
    borderTopColor: '#E91E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  deleteBookButton: {
    backgroundColor: '#F44336',
    paddingVertical: SPACING.lg + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 100,
  },
  deleteBookIcon: {
    width: 24,
    height: 24,
  },
  deleteBookText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: SPACING.sm + 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonSmall: {
    flex: 2,
  },
  saveButtonIcon: {
    width: 34,
    height: 34,
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalIconImage: {
    width: 80,
    height: 80,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xxlarge || 24,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: SPACING.md,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalMessage: {
    fontSize: FONTS.sizes.medium,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md + 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modalButtonConfirm: {
    backgroundColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonTextCancel: {
    color: '#616161',
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
  },
});

export default StorySettingsScreen;
