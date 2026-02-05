import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

export const AnimatedButton = ({ title, onPress, color = COLORS.primary, icon, style }) => {
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

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.8}>
      <Animated.View style={[styles.button, { backgroundColor: color }, animatedStyle, style]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.bold,
  },
});
