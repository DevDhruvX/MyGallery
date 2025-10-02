import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// OAuth configuration
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'mygallery',
  path: 'auth',
});

const PremiumLoginScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  console.log('PremiumLoginScreen rendering!');

  // Google OAuth configuration
  const googleAuthConfig = {
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        web: googleAuthConfig.webClientId,
        ios: googleAuthConfig.iosClientId,
        android: googleAuthConfig.androidClientId,
        default: googleAuthConfig.expoClientId,
      }),
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuthSuccess(response.params.code);
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (code: string) => {
    try {
      setIsLoading(true);
      
      // Exchange code for tokens - in a real app, this would be done on your backend
      Alert.alert(
        '🎉 Google Auth Success!',
        'Google authentication is configured! In production, this would exchange the auth code for tokens and sign in the user.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('❌ Auth Error', 'Failed to complete Google authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, show configuration notice
      Alert.alert(
        '🔧 Google OAuth Setup',
        'To enable Google OAuth, you need to:\\n\\n1. Create a Google Cloud Project\\n2. Configure OAuth credentials\\n3. Add your client IDs to the app\\n\\nFor now, use email/password authentication!',
        [
          { 
            text: 'Setup Guide', 
            onPress: () => WebBrowser.openBrowserAsync('https://docs.expo.dev/guides/authentication/#google') 
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('❌ Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
          }
        });
        if (error) throw error;
        Alert.alert('✅ Success!', 'Check your email for verification link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        Alert.alert('🎉 Welcome!', 'Logged in successfully');
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark 
          ? ['#1a1a1a', '#2d2d2d', '#1a1a1a'] 
          : ['#667eea', '#764ba2', '#f093fb']
        }
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF6347']}
              style={styles.logoGradient}
            >
              <Ionicons name="camera" size={40} color="white" />
            </LinearGradient>
          </View>
          
          <Text style={styles.appTitle}>My Gallery</Text>
          <Text style={styles.appSubtitle}>
            Capture, organize, and share your precious moments
          </Text>
        </View>

        {/* Auth Card */}
        <View style={[styles.authCard, { backgroundColor: theme.surface }]}>
          <View style={styles.authHeader}>
            <Text style={[styles.authTitle, { color: theme.text }]}>
              {isSignUp ? '🎉 Create Account' : '👋 Welcome Back'}
            </Text>
            <Text style={[styles.authSubtitle, { color: theme.textSecondary }]}>
              {isSignUp 
                ? 'Join thousands of users creating amazing galleries' 
                : 'Sign in to access your personal gallery'}
            </Text>
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity 
            style={[styles.googleButton, { borderColor: theme.textSecondary + '30' }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#4285F4', '#34A853', '#FBBC05', '#EA4335']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.googleGradient}
            >
              <View style={styles.googleContent}>
                <Ionicons name="logo-google" size={20} color="white" />
                <Text style={styles.googleText}>
                  {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.textSecondary + '30' }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              or continue with email
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.textSecondary + '30' }]} />
          </View>

          {/* Email Form */}
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { borderColor: theme.textSecondary + '30' }]}>
              <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email address"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={[styles.inputContainer, { borderColor: theme.textSecondary + '30' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={handleEmailAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.buttonText}>
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? '🚀 Create Account' : '🔓 Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch Auth Mode */}
          <View style={styles.switchContainer}>
            <Text style={[styles.switchText, { color: theme.textSecondary }]}>
              {isSignUp ? 'Already have an account?' : 'Need an account?'}
            </Text>
            <TouchableOpacity 
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchButton}
            >
              <Text style={[styles.switchButtonText, { color: theme.primary }]}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Hint */}
          <View style={styles.demoHint}>
            <Ionicons name="bulb-outline" size={16} color={theme.primary} />
            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
              Demo credentials are pre-filled for quick testing
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.7)' }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  authCard: {
    flex: 1,
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  authHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  googleButton: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  googleGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  switchText: {
    fontSize: 14,
  },
  switchButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
  demoText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PremiumLoginScreen;