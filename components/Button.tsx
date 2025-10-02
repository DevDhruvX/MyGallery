import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { BorderRadius, Shadows, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  gradient = false,
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

  const buttonStyles = [
    styles.button,
    styles[size],
    fullWidth && styles.fullWidth,
    variant === 'primary' && !gradient && { backgroundColor: theme.primary },
    variant === 'secondary' && { backgroundColor: theme.surfaceSecondary },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.primary,
    },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    (disabled || loading) && styles.disabled,
    isDark ? Shadows.dark.md : Shadows.light.md,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'primary' && { color: theme.textInverse },
    variant === 'secondary' && { color: theme.text },
    variant === 'outline' && { color: theme.primary },
    variant === 'ghost' && { color: theme.primary },
    (disabled || loading) && { opacity: 0.5 },
    textStyle,
  ];

  const content = (
    <>
      {leftIcon && !loading && leftIcon}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? theme.textInverse : theme.primary} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {rightIcon && !loading && rightIcon}
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={[buttonStyles, { backgroundColor: 'transparent' }]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.primary, theme.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  // Sizes
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  // Text
  text: {
    fontWeight: Typography.weights.semibold,
  },
  smText: {
    fontSize: Typography.sizes.sm,
  },
  mdText: {
    fontSize: Typography.sizes.md,
  },
  lgText: {
    fontSize: Typography.sizes.lg,
  },
});

export default Button;