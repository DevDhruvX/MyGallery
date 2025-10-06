import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import TextField from '../components/TextField';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useGoogleAuth } from '../services/googleAuth';
import { supabase } from '../supabaseConfig';

// WebBrowser.maybeCompleteAuthSession() is required for web support
WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  console.log('LoginScreen component rendering!');
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Google Auth hook
  const { signInWithGoogle } = useGoogleAuth();

  const handleEmailAuth = async () => {
    try {
      setIsLoading(true);

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
          },
        });

        if (error) throw error;

        Alert.alert(
          'Success!',
          'Please check your email for the confirmation link.',
          [{ text: 'OK' }]
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      Alert.alert(
        'Authentication Error',
        error.message || 'Authentication failed. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      const result = await signInWithGoogle();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Google sign-in successful!');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Authentication Error',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      
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
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* App Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            My Gallery
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Capture, organize, and share your precious moments
          </Text>

          {/* Login Card */}
          <Card 
            style={styles.loginCard}
            elevation="lg"
            blur={Platform.OS !== 'web'}
            blurIntensity={15}
          >
            <View style={styles.cardContent}>
              <Text style={[styles.welcomeText, { color: theme.text }]}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              
              <Text style={[styles.welcomeSubtext, { color: theme.textSecondary }]}>
                {isSignUp ? 'Create your account to get started' : 'Sign in to access your photo gallery'}
              </Text>

              {/* Email/Password Form */}
              <View style={styles.formContainer}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                  style={styles.textField}
                />

                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  style={styles.textField}
                />

                <Button
                  title={isSignUp ? 'Create Account' : 'Sign In'}
                  onPress={handleEmailAuth}
                  variant="primary"
                  size="lg"
                  fullWidth
                  gradient
                  loading={isLoading}
                  style={styles.authButton}
                />

                {/* Toggle Sign Up/Sign In */}
                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  style={styles.toggleButton}
                >
                  <Text style={[styles.toggleText, { color: theme.primary }]}>
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                  <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                </View>

                {/* Google Sign In */}
                <Button
                  title="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="outline"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  leftIcon={
                    !isLoading ? <Ionicons name="logo-google" size={20} color={theme.primary} /> : undefined
                  }
                  style={styles.googleButton}
                />
              </View>
              
              <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </Card>
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
    padding: Spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
  },
  cardContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  welcomeSubtext: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.md,
  },
  formContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  textField: {
    marginBottom: Spacing.lg,
  },
  authButton: {
    marginBottom: Spacing.md,
  },
  toggleButton: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
  },
  googleButton: {
    marginBottom: Spacing.lg,
  },
  privacyText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.sizes.xs,
  },
});

export default LoginScreen;