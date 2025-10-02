import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { BorderRadius, Shadows, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  blur?: boolean;
  blurIntensity?: number;
  pressable?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: keyof typeof BorderRadius;
  backgroundColor?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'lg',
  margin,
  blur = false,
  blurIntensity = 10,
  pressable = !!onPress,
  elevation = 'md',
  borderRadius = 'lg',
  backgroundColor,
}) => {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!pressable) return;
    
    scale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 300,
    });
    opacity.value = withSpring(0.9);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (!pressable) return;
    
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
    });
    opacity.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardStyles = [
    styles.card,
    {
      backgroundColor: backgroundColor || theme.surface,
      borderRadius: BorderRadius[borderRadius],
      padding: Spacing[padding],
      ...(margin && { margin: Spacing[margin] }),
      ...(isDark ? Shadows.dark[elevation] : Shadows.light[elevation]),
    },
    style,
  ];

  if (blur && Platform.OS !== 'web') {
    const content = (
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.blurContainer, { borderRadius: BorderRadius[borderRadius] }]}
      >
        <View style={{ padding: Spacing[padding] }}>
          {children}
        </View>
      </BlurView>
    );

    if (pressable && onPress) {
      return (
        <AnimatedTouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[animatedStyle, cardStyles, { padding: 0 }]}
          activeOpacity={1}
        >
          {content}
        </AnimatedTouchableOpacity>
      );
    }

    return (
      <Animated.View style={[cardStyles, { padding: 0 }]}>
        {content}
      </Animated.View>
    );
  }

  if (pressable && onPress) {
    return (
      <AnimatedTouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, cardStyles]}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View style={cardStyles}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default Card;