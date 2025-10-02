import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { BorderRadius, Shadows, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: 'default' | 'filled' | 'outlined';
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  style,
  inputStyle,
  variant = 'outlined',
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
  };

  const animatedLabelStyle = useAnimatedStyle(() => {
    const isActive = isFocused || value.length > 0;
    
    return {
      transform: [
        {
          translateY: interpolate(
            isActive ? 1 : 0,
            [0, 1],
            [0, -24]
          ),
        },
        {
          scale: interpolate(
            isActive ? 1 : 0,
            [0, 1],
            [1, 0.85]
          ),
        },
      ],
      color: interpolateColor(
        focusAnimation.value,
        [0, 1],
        [theme.textSecondary, error ? theme.error : theme.primary]
      ),
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnimation.value,
      [0, 1],
      [error ? theme.error : theme.border, error ? theme.error : theme.primary]
    ),
    borderWidth: interpolate(
      focusAnimation.value,
      [0, 1],
      [1, 2]
    ),
  }));

  const containerStyles = [
    styles.container,
    variant === 'filled' && {
      backgroundColor: theme.surfaceSecondary,
      borderWidth: 0,
    },
    variant === 'outlined' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
    },
    variant === 'default' && {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      borderRadius: 0,
    },
    disabled && styles.disabled,
    error && { borderColor: theme.error },
    isDark ? Shadows.dark.sm : Shadows.light.sm,
    style,
  ];

  const inputStyles = [
    styles.input,
    {
      color: theme.text,
      fontSize: Typography.sizes.md,
    },
    multiline && { height: numberOfLines * 24 + 32 },
    leftIcon && { paddingLeft: 48 },
    rightIcon && { paddingRight: 48 },
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && variant !== 'default' && (
        <Animated.Text style={[styles.label, animatedLabelStyle]}>
          {label}
        </Animated.Text>
      )}
      
      <Animated.View style={[containerStyles, animatedContainerStyle]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? theme.primary : theme.textSecondary}
            />
          </View>
        )}
        
        <TextInput
          style={inputStyles}
          placeholder={placeholder || label}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          selectionColor={theme.primary}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? theme.primary : theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error}
        </Text>
      )}
      
      {maxLength && (
        <Text style={[styles.counterText, { color: theme.textSecondary }]}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  container: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily,
    textAlignVertical: 'top',
    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
  },
  label: {
    position: 'absolute',
    left: Spacing.md,
    top: 12,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  counterText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'right',
    marginTop: Spacing.xs,
    marginRight: Spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default TextField;