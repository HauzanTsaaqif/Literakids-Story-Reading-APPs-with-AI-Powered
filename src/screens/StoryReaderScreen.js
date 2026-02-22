import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StoryReaderScreen = ({ route, navigation }) => {
  const { story } = route.params || {};

  // Validasi story
  if (!story || !story.content || !Array.isArray(story.content)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Cerita tidak ditemukan</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [currentPage, setCurrentPage] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const flatListRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const soundRef = useRef(null);
  const audioLoadedRef = useRef(false);

  const totalPages = story.content.length;

  // Mapping genres to cover images (use lowercase genre keys)
  const GENRE_COVERS = {
    hewan: require('../assets/images/cover/dunia_hewan.png'),
    petualangan: require('../assets/images/cover/petualangan.png'),
    sains: require('../assets/images/cover/sains_teknologi.png'),
    seni: require('../assets/images/cover/seni_musik.png'),
    keluarga: require('../assets/images/cover/keluarga_persahabatan.png'),
    pahlawan: require('../assets/images/cover/pahlawan_super.png'),
  };

  // Mapping genres to small icon for header badge
  const GENRE_ICONS = {
    hewan: require('../assets/images/icon/hewan.png'),
    petualangan: require('../assets/images/icon/petualangan.png'),
    sains: require('../assets/images/icon/sains.png'),
    seni: require('../assets/images/icon/seni.png'),
    keluarga: require('../assets/images/icon/keluarga.png'),
    pahlawan: require('../assets/images/icon/pahlawan.png'),
  };

  // Handlers
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

  const toggleAudio = async () => {
    if (!story.audioUrl) {
      alert('Audio tidak tersedia untuk cerita ini');
      return;
    }

    // Prevent double clicks while loading
    if (isLoadingAudio) {
      return;
    }

    if (isAudioPlaying && !isPaused) {
      // Pause audio
      if (soundRef.current) {
        try {
          await soundRef.current.pauseAsync();
          setIsPaused(true);
          if (autoPlayTimerRef.current) {
            clearInterval(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
          }
        } catch (error) {
          console.error('Error pausing audio:', error);
        }
      }
    } else if (isAudioPlaying && isPaused) {
      // Resume audio
      if (soundRef.current) {
        try {
          await soundRef.current.playAsync();
          setIsPaused(false);

          // Resume auto-slide
          const status = await soundRef.current.getStatusAsync();
          const remainingTime =
            (status.durationMillis - status.positionMillis) / 1000;
          const timePerPage = status.durationMillis / 1000 / totalPages;

          let pageIndex = currentPage;
          autoPlayTimerRef.current = setInterval(() => {
            pageIndex++;
            if (pageIndex < totalPages) {
              setCurrentPage(pageIndex);
              flatListRef.current?.scrollToIndex({
                index: pageIndex,
                animated: true,
              });
            } else {
              clearInterval(autoPlayTimerRef.current);
              autoPlayTimerRef.current = null;
            }
          }, timePerPage * 1000);
        } catch (error) {
          console.error('Error resuming audio:', error);
        }
      }
    } else {
      // Start playing audio from beginning
      // Prevent multiple audio instances
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (error) {
          console.error('Error cleaning up previous audio:', error);
        }
      }

      setIsLoadingAudio(true);
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: story.audioUrl },
          { shouldPlay: true },
          status => {
            if (status.isLoaded && status.didJustFinish) {
              console.log('Audio playback finished');
              setIsAudioPlaying(false);
              setIsPaused(false);
              if (autoPlayTimerRef.current) {
                clearInterval(autoPlayTimerRef.current);
                autoPlayTimerRef.current = null;
              }
            }
          },
        );

        soundRef.current = sound;
        audioLoadedRef.current = true;
        setIsAudioPlaying(true);
        setIsPaused(false);
        setIsLoadingAudio(false);
        console.log('Audio loaded and playing');

        const status = await sound.getStatusAsync();
        const totalDuration = status.durationMillis / 1000;
        const timePerPage = totalDuration / totalPages;

        let pageIndex = currentPage;
        autoPlayTimerRef.current = setInterval(() => {
          pageIndex++;
          if (pageIndex < totalPages) {
            setCurrentPage(pageIndex);
            flatListRef.current?.scrollToIndex({
              index: pageIndex,
              animated: true,
            });
          } else {
            clearInterval(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
          }
        }, timePerPage * 1000);
      } catch (error) {
        console.error('Failed to load audio', error);
        setIsLoadingAudio(false);
        alert(
          'Fitur audio player akan tersedia setelah rebuild aplikasi. Link audio: ' +
            story.audioUrl,
        );
      }
    }
  };

  const restartAudio = async () => {
    if (!story.audioUrl || isLoadingAudio) {
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }

      setIsAudioPlaying(false);
      setIsPaused(false);
      setIsLoadingAudio(false);
      setCurrentPage(0);
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });

      // Automatically start playing after restart
      setTimeout(() => {
        toggleAudio();
      }, 300);
    } catch (error) {
      console.error('Error restarting audio:', error);
      setIsLoadingAudio(false);
    }
  };

  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const page = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const renderPage = ({ item, index }) => (
    <View style={styles.pageContainer}>
      <View style={styles.pageBackground}>
        {/* Story Content Card */}
        <View style={styles.storyContentCard}>
          {/* Genre Cover Image */}
          <View style={styles.coverContainer}>
            {story.images && story.images[index] ? (
              <Image
                source={{ uri: story.images[index] }}
                style={styles.genreCoverImage}
                resizeMode="cover"
              />
            ) : story.genre && GENRE_COVERS[story.genre.toLowerCase()] ? (
              <Image
                source={GENRE_COVERS[story.genre.toLowerCase()]}
                style={styles.genreCoverImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.emojiIllustration}>
                {story.coverEmoji || '📖'}
              </Text>
            )}
          </View>
          <ScrollView
            style={styles.storyTextContainer}
            contentContainerStyle={styles.storyTextContent}
            nestedScrollEnabled={true}
            persistentScrollbar={Platform.OS === 'android'}
            showsVerticalScrollIndicator={true}>
            <Text style={styles.storyText}>{item}</Text>
          </ScrollView>

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

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Layer - Header */}
      <ImageBackground
        source={require('../assets/images/mascot/header_readerpage.jpg')}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      />

      {/* Background Layer - Footer */}
      <ImageBackground
        source={require('../assets/images/mascot/footer_readerpage.jpg')}
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
                source={require('../assets/images/icon/left_arrow.png')}
                style={styles.backIcon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text
              style={styles.headerTitle}
              numberOfLines={2}
              ellipsizeMode="tail">
              {story.title}
            </Text>
            {story.genre && GENRE_ICONS[story.genre.toLowerCase()] && (
              <View style={styles.headerGenreRow}>
                <Image
                  source={GENRE_ICONS[story.genre.toLowerCase()]}
                  style={styles.headerGenreImage}
                />
                <Text style={styles.headerGenreText}>
                  {story.genre.charAt(0).toUpperCase() + story.genre.slice(1)}
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
            data={story.content}
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
            nestedScrollEnabled={true}
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

        {/* Page Indicator - Fun & Colorful */}
        {/* <View style={styles.pageIndicatorContainer}>
            {story.content.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.pageIndicatorDot,
                  currentPage === index && styles.pageIndicatorDotActive,
                  currentPage === index && {
                    backgroundColor: index % 3 === 0 ? '#FFB6C1' : index % 3 === 1 ? '#87CEEB' : '#98FB98'
                  }
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
              source={require('../assets/images/icon/left_arrow.png')}
              style={styles.navButtonIcon}
            />
            <Text style={styles.centerButtonText}>Restart</Text>
          </TouchableOpacity>

          {/* Center Controls */}
          <View style={styles.centerControls}>
            {/* Audio Play/Pause Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.centerButton,
                styles.audioButton,
                isAudioPlaying && !isPaused && styles.audioButtonActive,
                isLoadingAudio && styles.loadingButton,
              ]}
              onPress={toggleAudio}
              disabled={!story.audioUrl || isLoadingAudio}>
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Image
                  source={
                    isAudioPlaying && !isPaused
                      ? require('../assets/images/icon/pause.png')
                      : require('../assets/images/icon/play.png')
                  }
                  style={styles.centerButtonIcon}
                />
              )}
              <Text style={styles.centerButtonText}>
                {isLoadingAudio
                  ? 'Loading...'
                  : isAudioPlaying && !isPaused
                    ? 'Pause'
                    : 'Play'}
              </Text>
            </TouchableOpacity>

            {/* Restart Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.centerButton,
                styles.restartButton,
              ]}
              onPress={restartAudio}
              disabled={!story.audioUrl || !isAudioPlaying}>
              <Image
                source={require('../assets/images/icon/recycle.png')}
                style={styles.centerButtonIcon}
              />
              <Text style={styles.centerButtonText}>Restart</Text>
            </TouchableOpacity>
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
              source={require('../assets/images/icon/right_arrow.png')}
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
    backgroundColor: '#FFF8F0',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    zIndex: 0,
    height: SCREEN_WIDTH * 0.75,
  },
  headerBackgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  footerBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    zIndex: -1,
  },
  footerBackgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
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
    backgroundColor: COLORS.white,
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
  headerBadge: {
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
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
    height: '100%',
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    zIndex: 10,
  },
  pageBackground: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    padding: SPACING.lg,
  },
  storyContentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg,
    height: SCREEN_HEIGHT * 0.6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#FFE5CC',
    position: 'relative',
  },
  pageNumberBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pageNumberText: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
    width: '100%',
  },
  genreCoverImage: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_HEIGHT * 0.22,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  emojiContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
    position: 'relative',
  },
  emojiIllustration: {
    fontSize: 72,
  },
  headerGenreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
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
  storyText: {
    fontSize: FONTS.sizes.medium,
    lineHeight: 40,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 0.5,
  },
  storyTextContainer: {
    flex: 1,
    height: '100%',
  },
  storyTextContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorativeDotsTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    gap: SPACING.xs,
  },
  decorativeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'transparent',
    height: SCREEN_HEIGHT * 0.05,
  },
  pageIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  pageIndicatorDotActive: {
    width: 28,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
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
  audioButton: {
    backgroundColor: COLORS.purple,
  },
  audioButtonActive: {
    backgroundColor: COLORS.orange,
  },
  loadingButton: {
    backgroundColor: COLORS.secondary,
    opacity: 0.8,
  },
  restartButton: {
    backgroundColor: COLORS.secondary,
  },
  controlButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.xlarge,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
});

export default StoryReaderScreen;
