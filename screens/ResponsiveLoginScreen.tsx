import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTallDevice = height > 800;

// OAuth configuration
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'mygallery',
  path: 'auth',
});

const ResponsiveLoginScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  console.log('ResponsiveLoginScreen rendering!');

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
      console.log('🔵 Starting Google sign-in...');
      console.log('🔵 Platform:', Platform.OS);
      
      // Use Supabase OAuth for both web and mobile
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'web' ? window.location.origin : 'mygallery://auth/callback',
        },
      });
      
      if (error) {
        console.error('🔴 OAuth Error:', error);
        throw error;
      }
      
      console.log('🔵 OAuth response:', data);
      
      if (Platform.OS === 'web') {
        console.log('🟢 Web Google sign-in initiated - redirecting...');
        // Web will redirect automatically
      } else {
        console.log('🔵 Opening OAuth URL in mobile browser:', data.url);
        
        // For mobile, open in browser and let Supabase handle the rest
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'mygallery://auth/callback',  // Proper mobile redirect
          {
            showInRecents: true,
          }
        );
        
        console.log('🔵 Mobile auth result:', result);
        
        if (result.type === 'success') {
          console.log('🟢 Mobile Google auth completed - checking session...');
          
          // Check for session after auth
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            console.log('� Session found after mobile auth!');
          } else {
            console.log('� No session yet - waiting for auth state change...');
          }
        } else if (result.type === 'cancel') {
          console.log('� User cancelled Google auth');
          return;
        }
      }
      
    } catch (error: any) {
      console.error('🔴 Google Sign-In Error:', error);
      Alert.alert(
        'Authentication Error',
        `Failed to sign in with Google: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
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
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={isDark 
            ? ['#1a1a1a', '#2d2d2d', '#1a1a1a'] 
            : ['#667eea', '#764ba2', '#f093fb']
          }
          style={styles.gradient}
        >
          {/* Centered Auth Card */}
          <View style={styles.centerContainer}>
            <View style={[styles.authCard, { 
              backgroundColor: theme.surface,
              width: width - (isSmallDevice ? 32 : 48),
              maxWidth: 400,
            }]}>
              <View style={styles.authHeader}>
                {/* App Logo */}
                <View style={styles.logoSection}>
                  <LinearGradient
                    colors={[theme.primary, theme.accent || theme.primary]}
                    style={[styles.logoIcon, {
                      width: isSmallDevice ? 48 : 56,
                      height: isSmallDevice ? 48 : 56,
                      borderRadius: isSmallDevice ? 24 : 28,
                    }]}
                  >
                    <Ionicons name="camera" size={isSmallDevice ? 24 : 28} color="white" />
                  </LinearGradient>
                  <Text style={[styles.appTitle, { 
                    color: theme.text,
                    fontSize: isSmallDevice ? 22 : 26,
                  }]}>
                    My Gallery
                  </Text>
                </View>
                
                <Text style={[styles.authSubtitle, { 
                  color: theme.textSecondary,
                  fontSize: isSmallDevice ? 12 : 14,
                  paddingHorizontal: isSmallDevice ? 10 : 20,
                }]}>
                  {isSignUp 
                    ? 'Join thousands of users creating amazing galleries' 
                    : 'Sign in to access your personal gallery'}
                </Text>
              </View>

              {/* Google Sign-In Button */}
              <TouchableOpacity 
                style={[styles.googleButton, { 
                  borderColor: theme.textSecondary + '30',
                  marginBottom: isSmallDevice ? 16 : 24,
                }]}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4285F4', '#34A853', '#FBBC05', '#EA4335']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.googleGradient, {
                    paddingVertical: isSmallDevice ? 12 : 16,
                  }]}
                >
                  <View style={styles.googleContent}>
                    <Ionicons name="logo-google" size={20} color="white" />
                    <Text style={[styles.googleText, {
                      fontSize: isSmallDevice ? 14 : 16,
                    }]}>
                      {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={[styles.divider, {
                marginBottom: isSmallDevice ? 16 : 24,
                gap: isSmallDevice ? 12 : 16,
              }]}>
                <View style={[styles.dividerLine, { backgroundColor: theme.textSecondary + '30' }]} />
                <Text style={[styles.dividerText, { 
                  color: theme.textSecondary,
                  fontSize: isSmallDevice ? 12 : 14,
                }]}>
                  or continue with email
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.textSecondary + '30' }]} />
              </View>

              {/* Email Form */}
              <View style={[styles.formContainer, {
                gap: isSmallDevice ? 12 : 16,
                marginBottom: isSmallDevice ? 16 : 24,
              }]}>
                {/* Email Input */}
                <View style={[styles.inputContainer, { 
                  borderColor: theme.textSecondary + '30',
                  backgroundColor: theme.background + '50',
                }]}>
                  <TextInput
                    style={[styles.input, { 
                      color: theme.text,
                      fontSize: isSmallDevice ? 14 : 16,
                      paddingHorizontal: isSmallDevice ? 16 : 20,
                      paddingVertical: isSmallDevice ? 14 : 16,
                    }]}
                    placeholder="Email address"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                </View>

                {/* Password Input */}
                <View style={[styles.inputContainer, { 
                  borderColor: theme.textSecondary + '30',
                  backgroundColor: theme.background + '50',
                }]}>
                  <TextInput
                    style={[styles.input, { 
                      color: theme.text,
                      fontSize: isSmallDevice ? 14 : 16,
                      paddingHorizontal: isSmallDevice ? 16 : 20,
                      paddingVertical: isSmallDevice ? 14 : 16,
                    }]}
                    placeholder="Password"
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                  />
                </View>

                {/* Sign In Button */}
                <TouchableOpacity 
                  style={[styles.primaryButton, { 
                    backgroundColor: theme.primary,
                    paddingVertical: isSmallDevice ? 12 : 16,
                  }]}
                  onPress={handleEmailAuth}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={[styles.buttonText, {
                        fontSize: isSmallDevice ? 14 : 16,
                      }]}>
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.buttonText, {
                      fontSize: isSmallDevice ? 14 : 16,
                    }]}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Switch Auth Mode */}
              <View style={[styles.switchContainer, {
                marginBottom: isSmallDevice ? 16 : 20,
              }]}>
                <Text style={[styles.switchText, { 
                  color: theme.textSecondary,
                  fontSize: isSmallDevice ? 12 : 14,
                }]}>
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setIsSignUp(!isSignUp)}
                  style={styles.switchButton}
                >
                  <Text style={[styles.switchButtonText, { 
                    color: theme.primary,
                    fontSize: isSmallDevice ? 12 : 14,
                  }]}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingVertical: 20,
  },
  authCard: {
    borderRadius: isSmallDevice ? 20 : 24,
    paddingHorizontal: isSmallDevice ? 20 : 28,
    paddingVertical: isSmallDevice ? 24 : 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  authHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  authTitle: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  googleButton: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  googleGradient: {
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
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    width: '100%',
    overflow: 'hidden',
  },
  input: {
    fontWeight: '500',
    width: '100%',
    minHeight: 48, // Ensure consistent height
    textAlignVertical: 'center', // Center text vertically on Android
  },
  primaryButton: {
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  switchText: {
    textAlign: 'center',
  },
  switchButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  switchButtonText: {
    fontWeight: '600',
  },
});

export default ResponsiveLoginScreen;