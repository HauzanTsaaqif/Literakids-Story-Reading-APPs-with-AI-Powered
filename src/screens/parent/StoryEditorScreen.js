import React, { useState, useRef } from 'react';
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
} from 'react-native';
import Animated from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import ParentHeader from '../../components/ParentHeader';
import { saveData } from '../../services/storage';
import { BASE_URL } from '@env';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [pageImages, setPageImages] = useState(storyData.images || {}); // Track images per page
  const flatListRef = useRef(null);

  const totalPages = editedPages.length;

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
      cerita: newPages.reduce((acc, page, idx) => {
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

      const apiUrl = `${BASE_URL}/generate-image`;
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
        cerita: editedPages,
        images: pageImages,
      };
      await saveData(storageKey, updatedStoryData);

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
    <View style={styles.pageContainer}>
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
            ) : themeData && GENRE_COVERS[themeData.name || themeData.label] ? (
              <Image
                source={GENRE_COVERS[themeData.name || themeData.label]}
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
          <TextInput
            style={styles.storyTextInput}
            value={item}
            onChangeText={text => handleTextChange(text, index)}
            multiline
            textAlignVertical="top"
            placeholder="Tulis cerita di sini..."
            placeholderTextColor="#BDBDBD"
          />

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
    </View>
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonCircle}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {storyData.judul || 'Edit Cerita'}
            </Text>
            {themeData && (
              <View style={styles.headerGenreRow}>
                {GENRE_ICONS[themeData.name || themeData.label] && (
                  <Image
                    source={GENRE_ICONS[themeData.name || themeData.label]}
                    style={styles.headerGenreImage}
                  />
                )}
                <Text style={styles.headerGenreText}>
                  {themeData.label || themeData.name}
                </Text>
              </View>
            )}
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                Halaman {currentPage + 1}/{totalPages}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleSaveAndPublish}>
            <Image
              source={require('../../assets/images/icon/accept.png')}
              style={styles.finishButtonIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content area: pages + indicator */}
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

      {/* Footer Controls */}
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
            {/* <Image
              source={require('../../assets/images/icon/left_arrow.png')}
              style={styles.navButtonIcon}
            /> */}
            <Text style={styles.navButtonText}>Prev</Text>
          </TouchableOpacity>

          {/* Generate Image Button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.generateButton]}
            onPress={handleGenerateImage}
            disabled={generatingImage}>
            {generatingImage ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                {/* <Image
                  source={require('../../assets/images/icon/genre.png')}
                  style={styles.generateButtonIcon}
                /> */}
                <Text style={styles.generateButtonText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.navButton,
              currentPage === totalPages - 1 && styles.controlButtonDisabled,
            ]}
            onPress={goToNextPage}
            disabled={currentPage === totalPages - 1}>
            <Text style={styles.navButtonText}>Next</Text>
            {/* <Image
              source={require('../../assets/images/icon/right_arrow.png')}
              style={styles.navButtonIcon}
            /> */}
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
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: FONTS.weights.bold,
    color: '#E91E63',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    textAlign: 'center',
  },
  headerGenreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  headerGenreImage: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  headerGenreText: {
    fontSize: FONTS.sizes.small,
    color: '#757575',
    fontWeight: FONTS.weights.medium,
  },
  headerBadge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 4,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.tiny,
    fontWeight: FONTS.weights.bold,
  },
  finishButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonIcon: {
    width: 28,
    height: 28,
  },
  contentWrapper: {
    flex: 1,
    zIndex: 5,
    marginTop: -SPACING.xxl,
  },
  pagesWrapper: {
    flex: 1,
  },
  flatListStyle: {
    flex: 1,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  pageBackground: {
    width: '100%',
    alignItems: 'center',
  },
  storyContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xl,
    width: '100%',
    marginTop: SPACING.lg,
    minHeight: SCREEN_HEIGHT * 0.66,
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
  storyTextInput: {
    fontSize: FONTS.sizes.large,
    lineHeight: 32,
    color: '#212121',
    fontWeight: FONTS.weights.medium,
    textAlign: 'justify',
    flex: 1,
    minHeight: 200,
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
    paddingBottom: 30,
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navButton: {
    flex: 1,
    maxWidth: 100,
  },
  navButtonIcon: {
    width: 20,
    height: 20,
  },
  navButtonText: {
    fontSize: FONTS.sizes.smal,
    fontWeight: FONTS.weights.bold,
    color: '#E91E63',
  },
  generateButton: {
    flex: 2,
    backgroundColor: '#E91E63',
    maxWidth: 150,
  },
  generateButtonIcon: {
    width: 20,
    height: 20,
  },
  generateButtonText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: '#FFFFFF',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
});

export default StoryEditorScreen;
