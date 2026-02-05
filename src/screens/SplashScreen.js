import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';

const SplashScreen = ({ navigation }) => {
  const logoScale = useSharedValue(0);
  const logoY = useSharedValue(-50);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(30);
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);
  const bookFloat = useSharedValue(0);

  useEffect(() => {
    // Logo entrance with bounce
    logoScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    
    logoY.value = withSpring(0, {
      damping: 12,
      stiffness: 100,
    });
    
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Floating book animation
    bookFloat.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Text slide up with fade
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    textY.value = withDelay(600, withSpring(0, { damping: 15 }));

    // Sparkle animations with delays
    sparkle1.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      )
    );

    sparkle2.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ),
        -1,
        true
      )
    );

    sparkle3.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 550 }),
          withTiming(0.5, { duration: 550 })
        ),
        -1,
        true
      )
    );

    // Navigate to main screen
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { translateY: logoY.value + bookFloat.value },
      ],
      opacity: logoOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textY.value }],
    };
  });

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1.value,
    transform: [{ scale: sparkle1.value }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2.value,
    transform: [{ scale: sparkle2.value }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3.value,
    transform: [{ scale: sparkle3.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated Sparkles Background */}
      <Animated.Text style={[styles.sparkleTopLeft, sparkle1Style]}>✨</Animated.Text>
      <Animated.Text style={[styles.sparkleTopRight, sparkle2Style]}>⭐</Animated.Text>
      <Animated.Text style={[styles.sparkleBottomLeft, sparkle3Style]}>🌟</Animated.Text>
      <Animated.Text style={[styles.sparkleBottomRight, sparkle1Style]}>✨</Animated.Text>
      
      {/* Logo with Image */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* Title and Subtitle */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>LiteraKids</Text>
        <Text style={styles.subtitle}>Belajar Membaca dengan Gembira!</Text>
        <View style={styles.tagline}>
          <Text style={styles.taglineText}>✨ Cerita Interaktif untuk Anak ✨</Text>
        </View>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, textAnimatedStyle]}>
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, sparkle1Style]} />
          <Animated.View style={[styles.dot, sparkle2Style]} />
          <Animated.View style={[styles.dot, sparkle3Style]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
  },
  // Sparkles positioned around the screen
  sparkleTopLeft: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    fontSize: 40,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: '20%',
    right: '12%',
    fontSize: 35,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: '25%',
    left: '15%',
    fontSize: 38,
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: '30%',
    right: '10%',
    fontSize: 36,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 182, 193, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 182, 193, 0.2)',
    borderRadius: 20,
  },
  taglineText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
});

export default SplashScreen;
