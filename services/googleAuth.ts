import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '../supabaseConfig';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = '535984161025-0djfrcgn7bkvvbao7b46pr7vmbfk962e.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const useGoogleAuth = () => {
  const redirectUri = AuthSession.makeRedirectUri({});

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      extraParams: {},
      prompt: AuthSession.Prompt.SelectAccount,
    },
    discovery
  );

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process...');
      
      if (Platform.OS === 'web') {
        // For web, use Supabase's built-in OAuth
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          throw error;
        }

        return { success: true, data };
      } else {
        // For mobile, use Expo AuthSession
        const result = await promptAsync();
        
        if (result.type === 'success' && result.params.code) {
          // Exchange the authorization code for tokens
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUri,
            },
          });

          if (error) {
            throw error;
          }

          return { success: true, data };
        } else {
          throw new Error('Google sign-in was cancelled or failed');
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google' 
      };
    }
  };

  return {
    signInWithGoogle,
    request,
    response,
  };
};