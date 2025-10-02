// Supabase configuration and initialization
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Environment-based configuration for production security
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';
const debugMode = process.env.EXPO_PUBLIC_DEBUG === 'true' && __DEV__;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase configuration. Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

// Create secure Supabase client with production-ready configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'implicit',
    // Only enable debug logging in development
    debug: debugMode,
  },
  // Add production-specific optimizations
  global: {
    headers: {
      'x-client-info': 'mygallery-app/1.0.0',
    },
  },
});

// Database types (we'll expand this as we build)
export interface GalleryItem {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export default supabase;