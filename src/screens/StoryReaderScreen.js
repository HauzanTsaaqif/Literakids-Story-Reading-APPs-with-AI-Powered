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
  Modal,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { feedbackService } from '../services/feedbackService';
import { auth } from '../config/firebase';

import { COLORS, FONTS, SPACING } from '../constants/theme';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MORAL_EVALUATION_QUESTIONS = {
  kejujuran: {
    1: 'Kalau kita tidak sengaja memecahkan barang, apa yang harus kita lakukan?',
    2: 'Kalau kita melihat mainan teman terjatuh, yang baik yang mana?',
  },
  tanggung_jawab: {
    1: 'Setelah selesai bermain, apa yang harus kita lakukan?',
    2: 'Bagaimana cara kita merawat tanaman di rumah?',
  },
  rasa_hormat: {
    1: 'Sebelum pergi ke sekolah atau bermain, kita harus melakukan apa kepada orang tua?',
    2: 'Kalau ada teman yang sedang berbicara, kita harus bagaimana?',
  },
  empati: {
    1: 'Kalau ada teman yang terjatuh, yang baik yang mana?',
    2: 'Kalau melihat teman sedang sedih, apa yang kita lakukan?',
  },
  keberanian: {
    1: 'Saat ibu guru bertanya di kelas, anak yang berani yang mana?',
    2: 'Kalau kita berbuat salah kepada teman, kita harus bagaimana?',
  },
};

// NOTE: Nama file di folder evaluation tidak konsisten huruf besar/kecil.
// Mapping ini sengaja mengikuti nama file persis untuk menghindari error di Android.
const MORAL_EVALUATION_IMAGES = {
  kejujuran_1: {
    positive: require('../assets/images/evaluation/kejujuran_1a.png'),
    negative: require('../assets/images/evaluation/kejujuran_1b.png'),
  },
  kejujuran_2: {
    positive: require('../assets/images/evaluation/Kejujuran_2a.png'),
    negative: require('../assets/images/evaluation/Kejujuran_2b.png'),
  },
  tanggung_jawab_1: {
    positive: require('../assets/images/evaluation/tanggung_jawab_1a.png'),
    negative: require('../assets/images/evaluation/tanggung_jawab_1b.png'),
  },
  tanggung_jawab_2: {
    positive: require('../assets/images/evaluation/tanggung_jawab_2a.png'),
    negative: require('../assets/images/evaluation/tanggung_jawab_2b.png'),
  },
  rasa_hormat_1: {
    positive: require('../assets/images/evaluation/rasa_hormat_1a.png'),
    negative: require('../assets/images/evaluation/rasa_hormat_1b.png'),
  },
  rasa_hormat_2: {
    positive: require('../assets/images/evaluation/rasa_hormat_2a.png'),
    negative: require('../assets/images/evaluation/rasa_hormat_2b.png'),
  },
  empati_1: {
    positive: require('../assets/images/evaluation/empati_1a.png'),
    negative: require('../assets/images/evaluation/Empati_1b.png'),
  },
  empati_2: {
    positive: require('../assets/images/evaluation/Empati_2a.png'),
    negative: require('../assets/images/evaluation/Empati_2b.png'),
  },
  keberanian_1: {
    positive: require('../assets/images/evaluation/Keberanian_1a.png'),
    negative: require('../assets/images/evaluation/Keberanian_1b.png'),
  },
  keberanian_2: {
    positive: require('../assets/images/evaluation/Keberanian_2a.png'),
    negative: require('../assets/images/evaluation/Keberanian_2b.png'),
  },
};

const getMoralCategoryKey = moralValue => {
  const moralLower = moralValue?.toLowerCase() || '';
  if (moralLower.includes('kejujuran')) return 'kejujuran';
  if (moralLower.includes('empati')) return 'empati';
  if (moralLower.includes('keberanian')) return 'keberanian';
  if (moralLower.includes('tanggung jawab')) return 'tanggung_jawab';
  if (moralLower.includes('rasa hormat')) return 'rasa_hormat';
  return null;
};

const pickMoralQuestion = moralValue => {
  const category = getMoralCategoryKey(moralValue) || 'kejujuran';
  const variant = Math.random() < 0.5 ? 1 : 2;
  const key = `${category}_${variant}`;
  const questionText =
    MORAL_EVALUATION_QUESTIONS[category]?.[variant] ||
    MORAL_EVALUATION_QUESTIONS.kejujuran[1];
  return { key, questionText };
};

const StoryReaderScreen = ({ route, navigation }) => {
  const { story } = route.params || {};

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  const [visualScore, setVisualScore] = useState(null);
  const [cognitiveScore, setCognitiveScore] = useState(null);
  const [engagementScore, setEngagementScore] = useState(null);

  const [feedbackStep, setFeedbackStep] = useState(1); // 1 = moral evaluation, 2 = rating cerita
  const [moralQuestionKey, setMoralQuestionKey] = useState(null);
  const [moralQuestionText, setMoralQuestionText] = useState('');
  const [moralEvaluation, setMoralEvaluation] = useState(null); // true=positif, false=negatif

  const getCurrentParentId = () => auth.currentUser?.uid || null;
  const getMasterBookId = () =>
    story?.masterBookId ||
    story?.id ||
    route?.params?.masterBookId ||
    route?.params?.bookId ||
    route?.params?.id ||
    null;

  const openFeedbackModal = () => {
    const picked = pickMoralQuestion(story?.moralValue);
    setFeedbackStep(1);
    setMoralQuestionKey(picked.key);
    setMoralQuestionText(picked.questionText);
    setMoralEvaluation(null);
    setVisualScore(null);
    setCognitiveScore(null);
    setEngagementScore(null);
    setShowFeedbackModal(true);
  };

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

  const submitFeedback = async () => {
    if (moralEvaluation === null) {
      Alert.alert(
        'Tunggu Dulu!',
        'Yuk jawab dulu pertanyaan moralnya dengan memilih gambar yang baik atau tidak baik.',
      );
      return;
    }

    if (!visualScore || !cognitiveScore || engagementScore === null) {
      Alert.alert(
        'Tunggu Dulu!',
        'Yuk isi semua penilaiannya dengan memilih emoji.',
      );
      return;
    }

    const currentParentId = getCurrentParentId();
    const masterBookId = getMasterBookId();

    if (!currentParentId || !masterBookId) {
      Alert.alert('Error', 'Data parent atau buku tidak valid.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await feedbackService.createFeedback(currentParentId, masterBookId, {
        visualAppealScore: visualScore,
        cognitiveLoadScore: cognitiveScore,
        engagementScore: engagementScore,
        moralEvaluation: moralEvaluation,
        moralValue: story?.moralValue || '',
      });

      setHasSubmittedFeedback(true);
      setShowFeedbackModal(false);
      Alert.alert('Terima Kasih!', 'Penilaianmu sudah disimpan.', [
        { text: 'Selesai', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      // Tangani error jika user sudah pernah memberi feedback
      if (error.message.includes('sudah ada')) {
        Alert.alert('Oops!', 'Kamu sudah pernah menilai buku ini sebelumnya.');
        setShowFeedbackModal(false);
      } else {
        Alert.alert('Error', 'Gagal mengirim penilaian. Coba lagi nanti.');
      }
    } finally {
      setIsSubmittingFeedback(false);
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
          {currentPage === totalPages - 1 ? (
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.navButton,
                { backgroundColor: COLORS.orange },
              ]}
              onPress={openFeedbackModal}
              disabled={hasSubmittedFeedback}>
              <Image
                source={require('../assets/images/icon/star.png')}
                style={styles.navButtonIcon}
              />
              <Text style={styles.navButtonText}>Nilai Cerita</Text>
            </TouchableOpacity>
          ) : (
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
          )}
        </View>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFeedbackModal(false)}>
              <Text style={styles.closeModalText}>X</Text>
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              {feedbackStep === 2 ? (
                <TouchableOpacity
                  style={styles.backStepButton}
                  onPress={() => setFeedbackStep(1)}>
                  <Text style={styles.backStepText}>← Kembali</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.backStepSpacer} />
              )}
              {/* <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>{feedbackStep}/2</Text>
              </View> */}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {feedbackStep === 1 ? (
                <>
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{moralQuestionText}</Text>

                    {moralQuestionKey &&
                    MORAL_EVALUATION_IMAGES[moralQuestionKey] ? (
                      <View style={styles.moralOptionsRow}>
                        <TouchableOpacity
                          style={[
                            styles.moralOptionCard,
                            moralEvaluation === true &&
                              styles.moralOptionActive,
                          ]}
                          onPress={() => setMoralEvaluation(true)}
                          activeOpacity={0.85}>
                          <Image
                            source={
                              MORAL_EVALUATION_IMAGES[moralQuestionKey].positive
                            }
                            style={styles.moralOptionImage}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.moralOptionCard,
                            moralEvaluation === false &&
                              styles.moralOptionActive,
                          ]}
                          onPress={() => setMoralEvaluation(false)}
                          activeOpacity={0.85}>
                          <Image
                            source={
                              MORAL_EVALUATION_IMAGES[moralQuestionKey].negative
                            }
                            style={styles.moralOptionImage}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ paddingVertical: SPACING.lg }}>
                        <ActivityIndicator color={COLORS.primary} />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.stepActionButton,
                      moralEvaluation === null && styles.stepActionDisabled,
                    ]}
                    onPress={() => {
                      if (moralEvaluation === null) return;
                      setFeedbackStep(2);
                    }}
                    disabled={moralEvaluation === null}>
                    <Text style={styles.stepActionText}>Lanjut</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* 1. Visual Appeal */}
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>
                      Bagaimana gambar-gambar di cerita ini, suka nggak?
                    </Text>
                    <View style={styles.emojiRow}>
                      {[1, 2, 3, 4, 5].map(score => {
                        const emojis = ['😡', '🙁', '😐', '🙂', '😍'];
                        return (
                          <TouchableOpacity
                            key={`vis-${score}`}
                            onPress={() => setVisualScore(score)}
                            style={[
                              styles.emojiButton,
                              visualScore === score && styles.emojiActive,
                            ]}>
                            <Text style={styles.emojiIcon}>
                              {emojis[score - 1]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 2. Cognitive Load */}
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>
                      Ceritanya seru atau susah dibaca?
                    </Text>
                    <View style={styles.emojiRow}>
                      {[1, 2, 3, 4, 5].map(score => {
                        // 1 = Susah/Bingung, 5 = Gampang/Seru
                        const emojis = ['🤯', '😕', '😐', '🙂', '🤩'];
                        return (
                          <TouchableOpacity
                            key={`cog-${score}`}
                            onPress={() => setCognitiveScore(score)}
                            style={[
                              styles.emojiButton,
                              cognitiveScore === score && styles.emojiActive,
                            ]}>
                            <Text style={styles.emojiIcon}>
                              {emojis[score - 1]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 3. Engagement (Again-Again) */}
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>
                      Besok mau baca cerita pakai aplikasi ini lagi nggak?
                    </Text>
                    <View style={styles.emojiRow}>
                      {[0, 1, 2].map(score => {
                        const emojis = ['👎\nNggak', '🤔\nMungkin', '👍\nMau!'];
                        return (
                          <TouchableOpacity
                            key={`eng-${score}`}
                            onPress={() => setEngagementScore(score)}
                            style={[
                              styles.emojiButtonLarge,
                              engagementScore === score &&
                                styles.emojiActiveLarge,
                            ]}>
                            <Text style={styles.emojiIconLarge}>
                              {emojis[score]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.submitFeedbackButton,
                      isSubmittingFeedback && { opacity: 0.7 },
                    ]}
                    onPress={submitFeedback}
                    disabled={isSubmittingFeedback}>
                    {isSubmittingFeedback ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.submitFeedbackText}>
                        Kirim Penilaian
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: SPACING.sm,
    borderWidth: 4,
    borderColor: '#FFE5CC',
    elevation: 10,
  },
  closeModalButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFE5CC',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  backStepButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFE5CC',
    borderRadius: 14,
  },
  backStepText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  backStepSpacer: {
    width: 90,
  },
  stepPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE5CC',
  },
  stepPillText: {
    fontSize: FONTS.sizes.small,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textLight,
  },
  questionContainer: {
    marginBottom: SPACING.lg,
    backgroundColor: '#FFF8F0',
    padding: SPACING.md,
    borderRadius: 20,
  },
  moralOptionsRow: {
    flexDirection: 'column',
    gap: SPACING.md,
  },
  moralOptionCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  moralOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE5CC',
  },
  moralOptionImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    resizeMode: 'contain',
    backgroundColor: '#FFF8F0',
  },
  stepActionButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepActionDisabled: {
    opacity: 0.5,
  },
  stepActionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
  },
  questionText: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  emojiButton: {
    padding: 5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE5CC',
  },
  emojiIcon: {
    fontSize: 32,
  },
  emojiButtonLarge: {
    padding: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  emojiActiveLarge: {
    borderColor: COLORS.secondary,
    backgroundColor: '#E6F3FF',
  },
  emojiIconLarge: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitFeedbackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitFeedbackText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
  },
});

export default StoryReaderScreen;
