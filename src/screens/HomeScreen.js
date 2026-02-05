import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StoryCard } from '../components';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { GENRES } from '../constants/stories';
import { authService, parentBooksService } from '../services/firebaseService';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [selectedGenres, setSelectedGenres] = useState(['all']);
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const waveY = useSharedValue(0);
  const bubbleScale = useSharedValue(1);
  const bubbleOpacity = useSharedValue(1);
  const mascotBounce = useSharedValue(0);

  const greetingMessages = [
    'Halo, Anak Pintar!',
    'Ayo baca cerita seru!',
    'Kamu pasti bisa!',
    'Semangat belajar!',
    'Kamu luar biasa!',
    'Terus berkarya ya!',
  ];

  useEffect(() => {
    // Mascot bounce animation
    mascotBounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500 }),
        withTiming(0, { duration: 1500 }),
      ),
      -1,
      true,
    );

    loadStories();

    // Rotate messages every 5 seconds with smooth fade
    const messageInterval = setInterval(() => {
      // Fade out
      bubbleOpacity.value = withTiming(0, { duration: 400 });
      bubbleScale.value = withTiming(0.95, { duration: 400 });

      // Change message in the middle of animation
      setTimeout(() => {
        setCurrentMessageIndex(prev => (prev + 1) % greetingMessages.length);
        // Fade in
        bubbleOpacity.value = withSpring(1, { damping: 12, stiffness: 100 });
        bubbleScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      }, 400);
    }, 5000);

    return () => clearInterval(messageInterval);
  }, []);

  const loadStories = async () => {
    try {
      const user = authService.getCurrentUser();

      if (user) {
        // Load books from parent's collection
        const parentBooks = await parentBooksService.getParentBooks(user.uid);
        setStories(parentBooks);
        setFilteredStories(parentBooks);
      } else {
        // No user logged in, show all global books
        const globalBooks = await parentBooksService.getAllBooks();
        setStories(globalBooks);
        setFilteredStories(globalBooks);
      }
    } catch (error) {
      console.error('Load Stories Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStories();
  };

  useEffect(() => {
    if (selectedGenres.includes('all')) {
      setFilteredStories(stories);
    } else {
      setFilteredStories(
        stories.filter(story => selectedGenres.includes(story.genre)),
      );
    }
  }, [selectedGenres, stories]);

  const toggleGenre = genreId => {
    if (genreId === 'all') {
      setSelectedGenres(['all']);
    } else {
      setSelectedGenres(prev => {
        const newGenres = prev.includes('all') ? [] : [...prev];
        if (newGenres.includes(genreId)) {
          const filtered = newGenres.filter(g => g !== genreId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newGenres, genreId];
        }
      });
    }
  };

  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: waveY.value }],
    };
  });

  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bubbleScale.value }],
      opacity: bubbleOpacity.value,
    };
  });

  const mascotAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: mascotBounce.value }],
    };
  });

  const handleStoryPress = story => {
    navigation.navigate('StoryReader', { story });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Greeting Section with Large Mascot and Speech Bubble */}
        <ImageBackground
          source={require('../assets/images/mascot/bg_mainpage2.png')}
          style={styles.greetingContainer}
          resizeMode="cover">
          <View style={styles.mascotSection}>
            <Animated.View style={[styles.mascotWrapper, mascotAnimatedStyle]}>
              <Image
                source={require('../assets/images/mascot/hello_mainpage.png')}
                style={styles.mascotImageLarge}
                resizeMode="contain"
              />
              {/* Speech Bubble with Animation */}
              <Animated.View style={[styles.speechBubble, bubbleAnimatedStyle]}>
                <View style={styles.bubbleContent}>
                  <Text style={styles.bubbleText}>
                    {greetingMessages[currentMessageIndex]}
                  </Text>
                </View>
                {/* <View style={styles.bubbleTail} /> */}
              </Animated.View>
            </Animated.View>
          </View>
        </ImageBackground>

        {/* Genre Filter Button */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}>
            <View style={styles.filterButtonContent}>
              <Image
                source={require('../assets/images/icon/genre.png')}
                style={styles.filterIconImage}
              />
              <View style={styles.filterTextContainer}>
                <Text style={styles.filterTitle}>Pilih Genre Favorit</Text>
                <Text style={styles.filterSubtitle}>
                  {selectedGenres.includes('all')
                    ? 'Semua Genre'
                    : `${selectedGenres.length} genre dipilih`}
                </Text>
              </View>
              <Text style={styles.filterArrow}>▶</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Genre Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Image
                    source={require('../assets/images/icon/genre.png')}
                    style={styles.modalTitleIcon}
                  />
                  <Text style={styles.modalTitle}>Pilih Genre Cerita</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {/* All Button */}
                <TouchableOpacity
                  style={[
                    styles.genreModalItem,
                    selectedGenres.includes('all') &&
                      styles.genreModalItemActive,
                    {
                      backgroundColor: selectedGenres.includes('all')
                        ? COLORS.primary
                        : COLORS.white,
                    },
                  ]}
                  onPress={() => toggleGenre('all')}>
                  <View style={styles.genreModalContent}>
                    <Image
                      source={require('../assets/images/icon/kids.png')}
                      style={styles.genreModalIconImage}
                    />
                    <Text
                      style={[
                        styles.genreModalText,
                        selectedGenres.includes('all') &&
                          styles.genreModalTextActive,
                      ]}>
                      Semua Genre
                    </Text>
                  </View>
                  {selectedGenres.includes('all') && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>

                {/* Genre Items */}
                {GENRES.map(genre => {
                  const getGenreIcon = genreId => {
                    const iconMap = {
                      hewan: require('../assets/images/icon/hewan.png'),
                      keluarga: require('../assets/images/icon/keluarga.png'),
                      sains: require('../assets/images/icon/sains.png'),
                      seni: require('../assets/images/icon/seni.png'),
                      pahlawan: require('../assets/images/icon/pahlawan.png'),
                      petualangan: require('../assets/images/icon/petualangan.png'),
                    };
                    return (
                      iconMap[genreId] ||
                      require('../assets/images/icon/kids.png')
                    );
                  };

                  return (
                    <TouchableOpacity
                      key={genre.id}
                      style={[
                        styles.genreModalItem,
                        selectedGenres.includes(genre.id) &&
                          styles.genreModalItemActive,
                        {
                          backgroundColor: selectedGenres.includes(genre.id)
                            ? genre.color
                            : COLORS.white,
                        },
                      ]}
                      onPress={() => toggleGenre(genre.id)}>
                      <View style={styles.genreModalContent}>
                        <Image
                          source={getGenreIcon(genre.id)}
                          style={styles.genreModalIconImage}
                        />
                        <Text
                          style={[
                            styles.genreModalText,
                            selectedGenres.includes(genre.id) &&
                              styles.genreModalTextActive,
                          ]}>
                          {genre.name}
                        </Text>
                      </View>
                      {selectedGenres.includes(genre.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.applyButtonText}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Stories Grid */}
        <View style={styles.storiesSection}>
          <View style={styles.storiesHeader}>
            <View style={styles.sectionTitleContainer}>
              <Image
                source={require('../assets/images/icon/book.png')}
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Koleksi Cerita</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {filteredStories.length}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Memuat cerita...</Text>
            </View>
          ) : (
            <>
              {filteredStories.map(story => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onPress={() => handleStoryPress(story)}
                />
              ))}

              {filteredStories.length === 0 && (
                <View style={styles.emptyState}>
                  <Image
                    source={require('../assets/images/icon/search.png')}
                    style={styles.largeIcon}
                  />
                  <Text style={styles.emptyText}>
                    Belum ada cerita di genre yang dipilih
                  </Text>
                  <Text style={styles.emptySubText}>
                    Coba pilih genre lain ya!
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.l,
  },
  greetingContainer: {
    width: screenWidth,
    height: 280,
    overflow: 'visible',
  },
  mascotSection: {
    alignItems: 'center',
  },
  mascotWrapper: {
    position: 'relative',
    alignItems: 'left',
    width: '100%',
  },
  mascotImageLarge: {
    top: 20,
    width: 260,
    height: 280,
    right: 26,
  },
  speechBubble: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    borderRadius: 20,
    padding: SPACING.md,
    minWidth: 200,
    maxWidth: 220,
    ...Platform.select({
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  bubbleContent: {
    alignItems: 'center',
  },
  bubbleText: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  sparkles: {
    flexDirection: 'row',
    gap: 4,
  },
  sparkle: {
    fontSize: 16,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 0,
    right: 3,
    width: 0,
    height: 0,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: COLORS.white,
  },
  welcomeText: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl * 2,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.medium,
    color: COLORS.textLight,
  },
  filterSection: {
    marginTop: -SPACING.lg - 2,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconImage: {
    width: 60,
    height: 60,
    marginRight: SPACING.md,
  },
  filterIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  filterSubtitle: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.textLight,
  },
  filterArrow: {
    fontSize: 24,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleIcon: {
    width: 60,
    height: 60,
    marginRight: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textLight,
    fontWeight: FONTS.weights.bold,
  },
  modalScroll: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  genreModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderRadius: 20,
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
  genreModalItemActive: {
    transform: [{ scale: 1.02 }],
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  genreModalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genreModalIconImage: {
    width: 36,
    height: 36,
    marginRight: SPACING.md,
  },
  genreModalIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  genreModalText: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  genreModalTextActive: {
    color: COLORS.white,
  },
  checkmark: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: FONTS.weights.heavy,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    alignItems: 'center',
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
  applyButtonText: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  storiesSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  storiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 46,
    height: 46,
    marginRight: SPACING.sm,
  },
  largeIcon: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
  },
  countBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginTop: SPACING.md,
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
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptySubText: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});

export default HomeScreen;
