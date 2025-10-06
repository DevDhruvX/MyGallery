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
        console.log('Initializing auth - checking for existing session...');
        
        // Try to get existing session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log('Session check result:', session ? 'Found existing session' : 'No session');
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

    // Timeout for auth initialization
    const forceTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth timeout - showing login screen');
        setSession(null);
        setIsLoading(false);
      }
    }, 3000);

    initializeAuth();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
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