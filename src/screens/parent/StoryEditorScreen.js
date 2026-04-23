import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import ParentHeader from '../../components/ParentHeader';
import { saveData } from '../../services/storage';
import { getCurrentBaseUrl } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StoryEditorScreen = ({ route, navigation }) => {
  const { storyData, storageKey, themeData, moralData } = route.params || {};

  if (!storyData || !storyData.cerita) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Data cerita tidak ditemukan</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Convert cerita object to array
  const pagesArray = Object.values(storyData.cerita);
  const [editedPages, setEditedPages] = useState(pagesArray);
  const [editedTitle, setEditedTitle] = useState(
    storyData.judul || 'Edit Cerita',
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [pageImages, setPageImages] = useState(storyData.images || {}); // Track images per page
  const [hasSaved, setHasSaved] = useState(false);
  const flatListRef = useRef(null);

  const totalPages = editedPages.length;

  // Add navigation listener for confirmation before leaving
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // If already saved, allow leaving
      if (hasSaved) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user before leaving the screen
      Alert.alert(
        'Konfirmasi',
        'Apakah anda yakin meninggalkan halaman editor sebelum cerita disimpan?',
        [
          { text: 'Batal', style: 'cancel', onPress: () => {} },
          {
            text: 'Keluar',
            style: 'destructive',
            onPress: () => {
              try {
                // Try to dispatch the original action
                navigation.dispatch(e.data.action);
              } catch (err) {
                // Fallback: call goBack if the action isn't handled by any navigator
                navigation.goBack();
              }
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasSaved]);

  // Mapping themes to cover images (using lowercase keys to match database)
  const GENRE_COVERS = {
    keluarga: require('../../assets/images/cover/keluarga_persahabatan.png'),
    sains: require('../../assets/images/cover/sains_teknologi.png'),
    hewan: require('../../assets/images/cover/dunia_hewan.png'),
    seni: require('../../assets/images/cover/seni_musik.png'),
    pahlawan: require('../../assets/images/cover/pahlawan_super.png'),
    petualangan: require('../../assets/images/cover/petualangan.png'),
  };

  const GENRE_ICONS = {
    keluarga: require('../../assets/images/icon/keluarga.png'),
    sains: require('../../assets/images/icon/sains.png'),
    hewan: require('../../assets/images/icon/hewan.png'),
    seni: require('../../assets/images/icon/seni.png'),
    pahlawan: require('../../assets/images/icon/pahlawan.png'),
    petualangan: require('../../assets/images/icon/petualangan.png'),
  };

  const goToNextPage = () => {
    console.log('Current page:', themeData.id);
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
    }
  };

  const handleTextChange = (text, index) => {
    const newPages = [...editedPages];
    newPages[index] = text;
    setEditedPages(newPages);

    // Auto-save to storage
    const updatedData = {
      ...storyData,
      judul: editedTitle,
      cerita: newPages.reduce((acc, page, idx) => {
        acc[idx + 1] = page;
        return acc;
      }, {}),
    };
    saveData(storageKey, updatedData);
  };

  const handleTitleChange = text => {
    setEditedTitle(text);

    // Auto-save to storage
    const updatedData = {
      ...storyData,
      judul: text,
      cerita: editedPages.reduce((acc, page, idx) => {
        acc[idx + 1] = page;
        return acc;
      }, {}),
    };
    saveData(storageKey, updatedData);
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);

    try {
      const prompt = editedPages[currentPage];
      if (!prompt || !prompt.trim()) {
        Alert.alert(
          'Error',
          'Teks halaman kosong, tidak dapat generate gambar',
        );
        return;
      }

      const apiUrl = `${await getCurrentBaseUrl()}/generate-image`;
      console.log('Calling API:', apiUrl, 'for page:', currentPage + 1);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Save image URL for this page
      const newPageImages = {
        ...pageImages,
        [currentPage]: data.image_url,
      };
      setPageImages(newPageImages);

      // Update storage
      const updatedData = {
        ...storyData,
        cerita: editedPages,
        images: newPageImages,
      };
      await saveData(storageKey, updatedData);

      Alert.alert('Berhasil!', 'Gambar berhasil dibuat untuk halaman ini');
    } catch (error) {
      console.error('Generate Image Error:', error);
      Alert.alert('Error', 'Gagal membuat gambar: ' + error.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const page = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const handleSaveAndPublish = async () => {
    try {
      // Save updated pages to local storage
      const updatedStoryData = {
        ...storyData,
        judul: editedTitle,
        cerita: editedPages,
        images: pageImages,
      };
      await saveData(storageKey, updatedStoryData);

      // Mark as saved to allow navigation without confirmation
      setHasSaved(true);

      // Navigate to Story Settings Screen
      navigation.navigate('StorySettingsScreen', {
        storyData: updatedStoryData,
        storageKey: storageKey,
        themeData: themeData,
        moralData: moralData,
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan cerita: ' + error.message);
    }
  };

  const renderPage = ({ item, index }) => (
    <KeyboardAvoidingView
      style={styles.pageContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageBackground}>
          {/* Story Content Card */}
          <View style={styles.storyContentCard}>
            {/* Genre Cover Image */}
            <View style={styles.coverContainer}>
              {pageImages[index] ? (
                <Image
                  source={{ uri: pageImages[index] }}
                  style={styles.genreCoverImage}
                  resizeMode="cover"
                />
              ) : themeData ? (
                <Image
                  source={GENRE_COVERS[themeData.id]}
                  style={styles.genreCoverImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.emojiIllustration}>
                  {themeData?.emoji || '📖'}
                </Text>
              )}
              {pageImages[index] && (
                <View style={styles.generatedBadge}>
                  <Text style={styles.generatedBadgeText}>Generated</Text>
                </View>
              )}
            </View>

            {/* Editable Story Text */}
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.storyTextInput}
                value={item}
                onChangeText={text => handleTextChange(text, index)}
                multiline
                textAlignVertical="top"
                placeholder="Tulis cerita di sini..."
                placeholderTextColor="#BDBDBD"
              />
            </View>

            {/* Decorative Elements */}
            <View style={styles.decorativeDotsTop}>
              <View
                style={[styles.decorativeDot, { backgroundColor: '#FFB6C1' }]}
              />
              <View
                style={[styles.decorativeDot, { backgroundColor: '#87CEEB' }]}
              />
              <View
                style={[styles.decorativeDot, { backgroundColor: '#98FB98' }]}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {/* Background Layer - Header */}
      <ImageBackground
        source={require('../../assets/images/mascot/header_readerpage.jpg')}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      />

      {/* Background Layer - Footer */}
      <ImageBackground
        source={require('../../assets/images/mascot/footer_readerpage.jpg')}
        style={styles.footerBackground}
        imageStyle={styles.footerBackgroundImage}
      />

      {/* Content Layer - Header Overlay */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <Image
                source={require('../../assets/images/icon/left_arrow.png')}
                style={styles.backIcon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <TextInput
              style={styles.headerTitleInput}
              value={editedTitle}
              onChangeText={handleTitleChange}
              placeholder="Masukkan judul cerita..."
              placeholderTextColor="#BDBDBD"
              multiline
              numberOfLines={2}
              textAlign="center"
            />
            {themeData && GENRE_ICONS[themeData.id || themeData.label] && (
              <View style={styles.headerGenreRow}>
                <Image
                  source={GENRE_ICONS[themeData.id || themeData.label]}
                  style={styles.headerGenreImage}
                />
                <Text style={styles.headerGenreText}>
                  {themeData.label || themeData.id}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight} />
        </View>
      </View>

      {/* Content area: pages + indicator (flex to allow footer sticky) */}
      <View style={styles.contentWrapper}>
        {/* Story Pages - Horizontal Slider */}
        <View style={styles.pagesWrapper}>
          <FlatList
            ref={flatListRef}
            data={editedPages}
            renderItem={renderPage}
            keyExtractor={(item, index) => `page-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            decelerationRate="fast"
            snapToAlignment="center"
            snapToInterval={SCREEN_WIDTH}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            style={styles.flatListStyle}
          />
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            Halaman {currentPage + 1}/{totalPages}
          </Text>
        </View>

        {/* Page Indicator */}
        {/* <View style={styles.pageIndicatorContainer}>
          {editedPages.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.pageIndicatorDot,
                currentPage === index && styles.pageIndicatorDotActive,
                currentPage === index && {
                  backgroundColor:
                    index % 3 === 0
                      ? '#FFB6C1'
                      : index % 3 === 1
                        ? '#87CEEB'
                        : '#98FB98',
                },
              ]}
            />
          ))}
        </View> */}
      </View>

      {/* Content Layer - Footer Overlay */}
      <View style={styles.footer}>
        <View style={styles.controlsContainer}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.navButton,
              currentPage === 0 && styles.controlButtonDisabled,
            ]}
            onPress={goToPreviousPage}
            disabled={currentPage === 0}>
            <Image
              source={require('../../assets/images/icon/left_arrow.png')}
              style={styles.navButtonIcon}
            />
            <Text style={styles.navButtonText}>Prev</Text>
          </TouchableOpacity>

          {/* Center Controls */}
          <View style={styles.centerControls}>
            {/* Generate Image Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.centerButton,
                styles.generateButton,
              ]}
              onPress={handleGenerateImage}
              disabled={generatingImage}>
              {generatingImage ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Image
                    source={require('../../assets/images/icon/target.png')}
                    style={styles.centerButtonIcon}
                  />
                  <Text style={styles.centerButtonText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Save Button - Show only on last page */}
            {currentPage === totalPages - 1 && (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  styles.centerButton,
                  styles.saveButton,
                ]}
                onPress={handleSaveAndPublish}>
                <Image
                  source={require('../../assets/images/icon/accept.png')}
                  style={styles.centerButtonIcon}
                />
                <Text style={styles.centerButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.navButton,
              currentPage === totalPages - 1 && styles.controlButtonDisabled,
            ]}
            onPress={goToNextPage}
            disabled={currentPage === totalPages - 1}>
            <Image
              source={require('../../assets/images/icon/right_arrow.png')}
              style={styles.navButtonIcon}
            />
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.xlarge,
    color: '#E91E63',
    marginBottom: SPACING.xl,
  },
  backButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
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
    height: 300,
    zIndex: 0,
  },
  footerBackgroundImage: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  header: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.2,
    justifyContent: 'center',
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg + 8,
    backgroundColor: 'transparent',
    height: 'auto',
  },
  backButton: {
    zIndex: 10,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderColor: COLORS.primary,
  },
  backIcon: {
    width: 36,
    height: 36,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitleInput: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    minHeight: 45,
  },
  headerGenreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  headerGenreImage: {
    width: 34,
    height: 34,
    marginRight: SPACING.sm,
  },
  headerGenreText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
  },
  headerBadge: {
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: SCREEN_WIDTH * 0.46,
  },
  headerBadgeText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  headerRight: {
    width: 45,
  },
  contentWrapper: {
    height: SCREEN_HEIGHT * 0.6,
  },
  pagesWrapper: {
    height: SCREEN_HEIGHT * 0.65,
  },
  flatListStyle: {
    flex: 1,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 150,
  },
  pageBackground: {
    width: '100%',
    alignItems: 'center',
  },
  storyContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg,
    width: '100%',
    marginTop: SPACING.lg,
    minHeight: SCREEN_HEIGHT * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  coverContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreCoverImage: {
    width: '100%',
    height: '100%',
  },
  generatedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generatedBadgeText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.tiny,
    fontWeight: FONTS.weights.bold,
  },
  emojiIllustration: {
    fontSize: 80,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    padding: SPACING.md,
    minHeight: 250,
  },
  storyTextInput: {
    fontSize: FONTS.sizes.medium,
    lineHeight: 28,
    color: '#212121',
    fontWeight: FONTS.weights.medium,
    textAlign: 'justify',
    flex: 1,
    minHeight: 180,
  },
  decorativeDotsTop: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    gap: 6,
  },
  decorativeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: 8,
    zIndex: 10,
  },
  pageIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  pageIndicatorDotActive: {
    width: 30,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 120,
    zIndex: 1,
  },
  controlsContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  navButton: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    gap: 6,
    minWidth: 90,
  },
  navButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  navButtonText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  centerControls: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  centerButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.secondary,
    minWidth: 75,
  },
  centerButtonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  centerButtonText: {
    fontSize: FONTS.sizes.tiny,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  generateButton: {
    backgroundColor: COLORS.purple,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
});

export default StoryEditorScreen;
