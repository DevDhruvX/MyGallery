import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
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
        console.log('Initializing auth...');
        
        // Check AsyncStorage directly first
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const storedSession = await AsyncStorage.default.getItem('supabase.auth.token');
        console.log('Stored session in AsyncStorage:', storedSession ? 'Found' : 'None');
        
        // Try to get session with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let session = null;
        
        while (attempts < maxAttempts && !session) {
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            session = data.session;
            if (session) break;
          } catch (error) {
            console.log(`Session attempt ${attempts + 1} failed:`, error);
          }
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
          }
        }
        
        if (mounted) {
          console.log('Final session result:', session ? 'Found' : 'None');
          setSession(session);
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

    // Reduce fallback timeout since we have retry logic
    const forceTimeout = setTimeout(() => {
      if (mounted) {
        console.log('FORCE TIMEOUT - Setting loading to false');
        setIsLoading(false);
        // Don't override session if we already have one
      }
    }, 8000); // Increased to 8 seconds to account for retry logic

    initializeAuth();

    // Listen for auth changes with better error handling
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        if (mounted) {
          setSession(session);
          setIsLoading(false);
          // Clear force timeout when we get a definitive auth state
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