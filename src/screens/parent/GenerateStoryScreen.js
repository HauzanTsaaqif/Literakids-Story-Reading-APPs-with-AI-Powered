import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FONTS, SPACING } from '../../constants/theme';
import {
  authService,
  booksService,
  parentBooksService,
} from '../../services/firebaseService';
import ParentHeader from '../../components/ParentHeader';
import { BASE_URL } from '@env';
import { saveData } from '../../services/storage';

const THEMES = [
  {
    id: 'keluarga',
    label: 'Keluarga & Persahabatan',
    icon: require('../../assets/images/icon/keluarga.png'),
    color: '#FFE5E5',
  },
  {
    id: 'sains',
    label: 'Sains & Teknologi',
    icon: require('../../assets/images/icon/sains.png'),
    color: '#E3F2FD',
  },
  {
    id: 'hewan',
    label: 'Dunia Hewan',
    icon: require('../../assets/images/icon/hewan.png'),
    color: '#FFF8E1',
  },
  {
    id: 'seni',
    label: 'Seni & Musik',
    icon: require('../../assets/images/icon/seni.png'),
    color: '#F3E5F5',
  },
  {
    id: 'pahlawan',
    label: 'Pahlawan Super',
    icon: require('../../assets/images/icon/pahlawan.png'),
    color: '#E8F5E9',
  },
  {
    id: 'petualangan',
    label: 'Petualangan',
    icon: require('../../assets/images/icon/petualangan.png'),
    color: '#FFF3E0',
  },
];

const MORAL_VALUES = [
  {
    id: 'kejujuran',
    label: 'Kejujuran',
    icon: require('../../assets/images/icon/kejujuran.png'),
    color: '#E3F2FD',
  },
  {
    id: 'empati',
    label: 'Empati',
    icon: require('../../assets/images/icon/empati.png'),
    color: '#FCE4EC',
  },
  {
    id: 'tanggung_jawab',
    label: 'Tanggung Jawab',
    icon: require('../../assets/images/icon/tanggung_jawab.png'),
    color: '#E8F5E9',
  },
  {
    id: 'keberanian',
    label: 'Keberanian',
    icon: require('../../assets/images/icon/keberanian.png'),
    color: '#FFF3E0',
  },
  {
    id: 'rasa_hormat',
    label: 'Rasa Hormat',
    icon: require('../../assets/images/icon/rasa_hormat.png'),
    color: '#F3E5F5',
  },
];

const WORD_COUNTS = [100, 200, 300, 400, 500];

const GenerateStoryScreen = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedMoral, setSelectedMoral] = useState(null);
  const [selectedWordCount, setSelectedWordCount] = useState(300);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTheme || !selectedMoral) {
      Alert.alert('Perhatian', 'Pilih tema dan nilai moral terlebih dahulu');
      return;
    }

    setGenerating(true);

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Sesi berakhir, silakan login kembali');
        navigation.replace('Login');
        return;
      }

      // Call API to generate story
      const apiUrl = `${BASE_URL}/generate`;
      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moral: selectedMoral.label,
          theme: selectedTheme.label,
          word: selectedWordCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Save to local storage
      const storageKey = `@generated_story_${Date.now()}`;
      await saveData(storageKey, data);

      // Navigate to editor screen
      navigation.navigate('StoryEditorScreen', {
        storyData: data,
        storageKey: storageKey,
        themeData: selectedTheme,
        moralData: selectedMoral,
      });
    } catch (error) {
      console.error('Generate Story Error:', error);
      Alert.alert('Error', 'Gagal membuat cerita: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ParentHeader
        title="Generate Cerita"
        subtitle="Buat Cerita Sesuai Keinginan"
        onBackPress={() => navigation.goBack()}
        onAccountPress={() => navigation.navigate('SettingsScreen')}
      />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
        {/* Theme Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/icon/genre.png')}
              style={styles.sectionIcon}
            />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Pilih Tema Cerita</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih satu tema untuk cerita
              </Text>
            </View>
          </View>

          <View style={styles.optionsGrid}>
            {THEMES.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: theme.color },
                  selectedTheme?.id === theme.id && styles.optionCardActive,
                ]}
                onPress={() => setSelectedTheme(theme)}>
                <View style={styles.optionIconContainer}>
                  <Image
                    source={theme.icon}
                    style={[
                      styles.optionIcon,
                      selectedTheme?.id === theme.id && styles.optionIconActive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedTheme?.id === theme.id && styles.optionLabelActive,
                  ]}>
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Moral Value Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/icon/target.png')}
              style={styles.sectionIcon}
            />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Pilih Nilai Moral</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih satu nilai yang ingin diajarkan
              </Text>
            </View>
          </View>

          <View style={styles.optionsGrid}>
            {MORAL_VALUES.map(moral => (
              <TouchableOpacity
                key={moral.id}
                style={[
                  styles.optionCard,
                  styles.moralCard,
                  { backgroundColor: moral.color },
                  selectedMoral?.id === moral.id && styles.optionCardActive,
                ]}
                onPress={() => setSelectedMoral(moral)}>
                <View style={styles.optionIconContainer}>
                  <Image
                    source={moral.icon}
                    style={[
                      styles.optionIcon,
                      selectedMoral?.id === moral.id && styles.optionIconActive,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedMoral?.id === moral.id && styles.optionLabelActive,
                  ]}>
                  {moral.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Word Count Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/images/icon/font.png')}
              style={styles.sectionIcon}
            />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Panjang Cerita</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih jumlah kata maksimal
              </Text>
            </View>
          </View>

          <View style={styles.wordCountGrid}>
            {WORD_COUNTS.map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.wordCountButton,
                  selectedWordCount === count && styles.wordCountButtonActive,
                ]}
                onPress={() => setSelectedWordCount(count)}>
                <Text
                  style={[
                    styles.wordCountText,
                    selectedWordCount === count && styles.wordCountTextActive,
                  ]}>
                  {count}
                </Text>
                <Text
                  style={[
                    styles.wordCountLabel,
                    selectedWordCount === count && styles.wordCountLabelActive,
                  ]}>
                  kata
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        {selectedTheme && selectedMoral && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Preview Cerita</Text>
            </View>

            <View style={styles.previewContent}>
              <View style={styles.previewItem}>
                <View style={styles.previewIconBox}>
                  <Image
                    source={selectedTheme.icon}
                    style={styles.previewIconLarge}
                  />
                </View>
                <View style={styles.previewItemText}>
                  <Text style={styles.previewItemLabel}>Tema Cerita</Text>
                  <Text style={styles.previewItemValue}>
                    {selectedTheme.label}
                  </Text>
                </View>
              </View>

              <View style={styles.previewItem}>
                <View style={styles.previewIconBox}>
                  <Image
                    source={selectedMoral.icon}
                    style={styles.previewIconLarge}
                  />
                </View>
                <View style={styles.previewItemText}>
                  <Text style={styles.previewItemLabel}>Nilai Moral</Text>
                  <Text style={styles.previewItemValue}>
                    {selectedMoral.label}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewStats}>
                <View style={styles.previewStatItem}>
                  <Text style={styles.previewStatIcon}>📖</Text>
                  <Text style={styles.previewStatLabel}>Panjang</Text>
                  <Text style={styles.previewStatValue}>
                    ~{selectedWordCount} kata
                  </Text>
                </View>
                <View style={styles.previewStatDivider} />
                <View style={styles.previewStatItem}>
                  <Text style={styles.previewStatIcon}>⏱️</Text>
                  <Text style={styles.previewStatLabel}>Estimasi Baca</Text>
                  <Text style={styles.previewStatValue}>
                    {Math.ceil(selectedWordCount / 50)} menit
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Generate Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (!selectedTheme || !selectedMoral || generating) &&
              styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!selectedTheme || !selectedMoral || generating}>
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Cerita ✨</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    borderRadius: 16,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionIcon: {
    width: 50,
    height: 50,
    marginRight: SPACING.xs,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionCard: {
    width: '48%',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 110,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moralCard: {
    minHeight: 100,
  },
  optionCardActive: {
    borderColor: '#E91E63',
    borderWidth: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.03 }],
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  optionIconActive: {
    transform: [{ scale: 1.1 }],
  },
  optionEmoji: {
    fontSize: 44,
    marginBottom: SPACING.sm,
  },
  optionEmojiActive: {
    transform: [{ scale: 1.15 }],
  },
  optionLabel: {
    fontSize: FONTS.sizes.small - 2,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 18,
  },
  optionLabelActive: {
    color: '#E91E63',
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.small - 2,
  },
  wordCountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  wordCountButton: {
    width: '46%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  wordCountButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  wordCountText: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
  },
  wordCountTextActive: {
    color: '#FFFFFF',
  },
  wordCountLabel: {
    fontSize: FONTS.sizes.tiny,
    color: '#757575',
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  wordCountLabelActive: {
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFE5E5',
  },
  previewHeader: {
    backgroundColor: '#E91E63',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  previewBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.tiny,
    fontWeight: FONTS.weights.bold,
  },
  previewContent: {
    padding: SPACING.xl,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: '#FAFAFA',
    padding: SPACING.md,
    borderRadius: 12,
  },
  previewIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  previewIconLarge: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  previewEmojiLarge: {
    fontSize: 32,
  },
  previewItemText: {
    flex: 1,
  },
  previewItemLabel: {
    fontSize: FONTS.sizes.tiny,
    color: '#9E9E9E',
    fontWeight: FONTS.weights.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewItemValue: {
    fontSize: FONTS.sizes.large,
    color: '#212121',
    fontWeight: FONTS.weights.bold,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: SPACING.md,
  },
  previewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  previewStatIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  previewStatLabel: {
    fontSize: FONTS.sizes.tiny,
    color: '#9E9E9E',
    fontWeight: FONTS.weights.medium,
    marginBottom: 4,
  },
  previewStatValue: {
    fontSize: FONTS.sizes.medium,
    color: '#E91E63',
    fontWeight: FONTS.weights.bold,
  },
  previewStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
    marginHorizontal: SPACING.sm,
  },
  bottomSpacing: {
    height: SPACING.xxl * 2,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  generateButton: {
    backgroundColor: '#E91E63',
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.5,
  },
});

export default GenerateStoryScreen;
