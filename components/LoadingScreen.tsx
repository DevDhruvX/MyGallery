import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const LoadingScreen: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark 
          ? [theme.background, theme.surfaceSecondary] 
          : [theme.primary + '10', theme.background]
        }
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* App Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Ionicons name="images" size={48} color={theme.textInverse} />
          </View>
          
          {/* App Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            My Gallery
          </Text>
          
          {/* Loading Indicator */}
          <ActivityIndicator 
            size="large" 
            color={theme.primary} 
            style={styles.loader}
          />
          
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading your gallery...
          </Text>

          {Platform.OS !== 'web' && (
            <Text style={[styles.debugText, { color: theme.textSecondary }]}>
              Platform: {Platform.OS}
            </Text>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  loader: {
    marginBottom: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  debugText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});

export default LoadingScreen;