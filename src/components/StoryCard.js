import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

// Mapping genre to cover images
const GENRE_COVERS = {
  keluarga: require('../assets/images/cover/keluarga_persahabatan.png'),
  sains: require('../assets/images/cover/sains_teknologi.png'),
  hewan: require('../assets/images/cover/dunia_hewan.png'),
  seni: require('../assets/images/cover/seni_musik.png'),
  pahlawan: require('../assets/images/cover/pahlawan_super.png'),
  petualangan: require('../assets/images/cover/petualangan.png'),
};

// Palet warna ceria khusus untuk badge
const BADGE_THEMES = {
  moral: { bg: '#FFE4E1', text: '#D81B60' }, // Soft Pink
  duration: { bg: '#FFF3E0', text: '#E65100' }, // Soft Orange
  genre: { bg: '#E3F2FD', text: '#1565C0' }, // Soft Blue
  age: { bg: '#E8F5E9', text: '#2E7D32' }, // Soft Green
};

export const StoryCard = ({ story, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Animasi yang lebih membal (squishy) untuk anak-anak
  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  const getGenreIcon = genre => {
    const icons = {
      keluarga: require('../assets/images/icon/keluarga.png'),
      sains: require('../assets/images/icon/sains.png'),
      hewan: require('../assets/images/icon/hewan.png'),
      seni: require('../assets/images/icon/seni.png'),
      pahlawan: require('../assets/images/icon/pahlawan.png'),
      petualangan: require('../assets/images/icon/petualangan.png'),
    };
    return icons[genre] || icons.petualangan;
  };

  const getMoralIcon = moralValue => {
    const moralLower = moralValue?.toLowerCase() || '';
    if (moralLower.includes('kejujuran'))
      return require('../assets/images/icon/kejujuran.png');
    if (moralLower.includes('empati'))
      return require('../assets/images/icon/empati.png');
    if (moralLower.includes('keberanian'))
      return require('../assets/images/icon/keberanian.png');
    if (moralLower.includes('tanggung jawab'))
      return require('../assets/images/icon/tanggung_jawab.png');
    if (moralLower.includes('rasa hormat'))
      return require('../assets/images/icon/rasa_hormat.png');
    return require('../assets/images/icon/target.png');
  };

  // Get cover image based on genre
  const coverSource =
    story.coverImage || GENRE_COVERS[story.genre] || GENRE_COVERS.keluarga;

  // Sub-komponen untuk mempermudah render Badge
  const BadgeItem = ({ icon, text, theme }) => (
    <View style={[styles.badgeItem, { backgroundColor: theme.bg }]}>
      <Image source={icon} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Decorative Badge on top of image (Opsional, agar estetik) */}
        {/* <View style={styles.imageOverlayBadge}>
          <Text style={styles.overlayBadgeText}>✨ Cerita Baru</Text>
        </View> */}

        <View style={styles.coverContainer}>
          <Image
            source={coverSource}
            style={styles.coverImageStyle}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {story.title}
          </Text>

          {/* Garis pemisah tipis */}
          <View style={styles.divider} />

          <View style={styles.badgesWrapper}>
            {/* <BadgeItem
              icon={getMoralIcon(story.moralValue)}
              text={story.moralValue}
              theme={BADGE_THEMES.moral}
            /> */}
            <BadgeItem
              icon={getGenreIcon(story.genre)}
              text={story.genre}
              theme={BADGE_THEMES.genre}
            />
            <BadgeItem
              icon={require('../assets/images/icon/clock.png')}
              text={`${story.estimatedDuration} menit`}
              theme={BADGE_THEMES.duration}
            />
            <BadgeItem
              icon={require('../assets/images/icon/kids.png')}
              text={`${story.ageRange} tahun`}
              theme={BADGE_THEMES.age}
            />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Putih bersih agar warna badge menonjol
    borderRadius: 24, // Lebih melengkung
    borderWidth: 3,
    borderColor: '#FFF0F5', // Border pink sangat muda
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(233, 30, 99, 0.1)',
      },
      default: {
        shadowColor: '#f7ff59', // Shadow agak pink agar playful
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overlayBadgeText: {
    fontSize: FONTS.sizes.tiny,
    fontWeight: '900',
    color: '#E91E63',
  },
  coverContainer: {
    backgroundColor: '#FCE4EC',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: '#FFF0F5',
  },
  coverImageStyle: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.large,
    fontWeight: '900', // Sangat tebal agar menarik perhatian anak
    color: '#2C3E50', // Biru gelap yang tidak setajam hitam murni
    marginBottom: SPACING.xs,
    lineHeight: 28,
  },
  divider: {
    height: 2,
    backgroundColor: '#F5F5F5',
    marginVertical: SPACING.sm,
    borderRadius: 2,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Mendorong item ke ujung kiri dan kanan
    marginTop: SPACING.xs,
    rowGap: 8, // Memberi jarak antar baris atas dan bawah
  },
  badgeItem: {
    width: '48%', // Mengambil 48% lebar ruang (menghasilkan 2 kolom yang rapi)
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    // CATATAN PENTING: Hapus alignSelf: 'flex-start' di sini
  },
  badgeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  badgeText: {
    fontSize: FONTS.sizes.tiny,
    fontWeight: 'bold',
    flex: 1, // Tambahkan flex: 1 agar teks panjang terpotong otomatis (tambah titik-titik) tanpa merusak layout
  },
});
