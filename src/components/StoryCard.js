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

export const StoryCard = ({ story, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Get cover image based on genre
  const coverSource =
    story.coverImage || GENRE_COVERS[story.genre] || GENRE_COVERS.keluarga;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}>
      <Animated.View style={[styles.card, animatedStyle]}>
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
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}></Text>
              <Text style={styles.metaText}>{story.ageRange} thn</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}></Text>
              <Text style={styles.metaText}>
                {story.estimatedDuration || story.duration} mnt
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  coverContainer: {
    backgroundColor: COLORS.lightGray,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverImageStyle: {
    width: '100%',
    height: '100%',
  },
  coverEmoji: {
    fontSize: 80,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.textLight,
  },
});
