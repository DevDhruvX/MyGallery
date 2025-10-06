import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';
import ResponsiveLoginScreen from '../screens/ResponsiveLoginScreen';
import { supabase } from '../supabaseConfig';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth - forcing fresh login...');
        
        // FORCE LOGOUT: Clear any existing sessions/tokens
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        
        // Clear all possible auth storage
        await AsyncStorage.default.removeItem('supabase.auth.token');
        await AsyncStorage.default.removeItem('supabase.auth.refresh_token');
        await AsyncStorage.default.removeItem('supabase.auth.session');
        
        // Clear web storage if on web platform
        if (Platform.OS === 'web') {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('supabase.auth.token');
              localStorage.removeItem('sb-zjciguygyrnwceymvsfn-auth-token');
            }
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.clear();
            }
          } catch (e) {
            console.log('Web storage clear error:', e);
          }
        }
        
        // Force sign out from Supabase to ensure clean state
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (signOutError) {
          console.log('Sign out error (expected):', signOutError);
        }
        
        if (mounted) {
          console.log('Forced logout complete - requiring fresh login');
          setSession(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.log('Auth initialization failed:', error);
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    // Shorter timeout since we're not checking for existing sessions
    const forceTimeout = setTimeout(() => {
      if (mounted) {
        console.log('FORCE TIMEOUT - Showing login screen');
        setSession(null);
        setIsLoading(false);
      }
    }, 2000); // Reduced to 2 seconds

    initializeAuth();

    // Listen for auth changes (only for new logins)
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session ? 'New session created' : 'Session cleared');
        if (mounted) {
          setSession(session);
          setIsLoading(false);
          clearTimeout(forceTimeout);
        }
      });
      authSubscription = subscription;
    } catch (error) {
      console.log('Error setting up auth listener:', error);
    }

    return () => {
      mounted = false;
      clearTimeout(forceTimeout);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  console.log('AppNavigator render - isLoading:', isLoading, 'session:', session ? 'exists' : 'null');

  if (isLoading) {
    console.log('Showing LoadingScreen');
    return <LoadingScreen />;
  }

  console.log('Showing NavigationContainer with', session ? 'TabNavigator' : 'LoginScreen');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            initialParams={{ user: session.user }}
          />
        ) : (
          <Stack.Screen name="Login" component={ResponsiveLoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;