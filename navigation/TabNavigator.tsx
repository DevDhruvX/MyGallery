import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform } from 'react-native';
import { BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import BackupManagerScreen from '../screens/BackupManagerScreen';
import ModernGalleryScreen from '../screens/ModernGalleryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Gallery') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Backup') {
            iconName = focused ? 'cloud' : 'cloud-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          borderTopLeftRadius: BorderRadius.xl,
          borderTopRightRadius: BorderRadius.xl,
          position: 'absolute',
          marginHorizontal: Platform.OS === 'ios' ? 16 : 0,
          marginBottom: Platform.OS === 'ios' ? 16 : 0,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={{
                flex: 1,
                borderTopLeftRadius: BorderRadius.xl,
                borderTopRightRadius: BorderRadius.xl,
                overflow: 'hidden',
              }}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.surface,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: theme.text,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Gallery" 
        component={ModernGalleryScreen}
        options={{
          title: 'My Gallery',
        }}
      />
      <Tab.Screen 
        name="Backup" 
        component={BackupManagerScreen}
        options={{
          title: 'Backup',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;