import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface GalleryHeaderProps {
  user: any;
  theme: any;
  galleryCount: number;
  captionedCount: number;
  onSearchPress: () => void;
  onLogoutPress: () => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  user,
  theme,
  galleryCount,
  captionedCount,
  onSearchPress,
  onLogoutPress,
}) => {
  const insets = useSafeAreaInsets();

  const HEADER_HEIGHT = (width < 375 ? 70 : width < 414 ? 80 : 90) + insets.top; // Reduced height significantly

  return (
    <View 
      style={{
        height: HEADER_HEIGHT,
        backgroundColor: theme.background,
        paddingTop: insets.top, // Restored normal padding
      }}
    >
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12, // Increased padding for better text positioning
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, maxWidth: '88%' }}> {/* Increased width even more */}
            <View style={{ position: 'relative', marginRight: 14 }}> {/* Slightly increased margin */}
              <Image
                source={{ 
                  uri: user?.user_metadata?.avatar_url || 
                       user?.photoURL || 
                       `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=random&color=fff&size=120`
                }}
                style={{
                  width: width < 375 ? 60 : width < 414 ? 70 : 80, // Increased avatar size back
                  height: width < 375 ? 60 : width < 414 ? 70 : 80,
                  borderRadius: width < 375 ? 30 : width < 414 ? 35 : 40,
                  borderWidth: 3, // Increased border width back
                  borderColor: theme.primary + '50', // Slightly more opaque border
                }}
                onError={(error) => {
                  console.log('Avatar load error:', error);
                }}
              />
              <View style={{
                position: 'absolute',
                bottom: 2, // Moved up slightly from the edge
                right: 2, // Moved in slightly from the edge
                backgroundColor: '#10B981',
                width: width < 375 ? 16 : width < 414 ? 18 : 22, // Increased size to be more visible
                height: width < 375 ? 16 : width < 414 ? 18 : 22,
                borderRadius: width < 375 ? 8 : width < 414 ? 9 : 11,
                borderWidth: 3, // Increased border for better definition
                borderColor: theme.background,
              }} />
            </View>
            
            <View style={{ flex: 1, minWidth: 0 }}> {/* Added minWidth: 0 for text overflow */}
              <Text style={{
                color: theme.text,
                fontSize: width < 375 ? 16 : width < 414 ? 18 : 21, // Slightly larger name
                fontWeight: '700',
                marginBottom: 2, // Reduced margin
              }} numberOfLines={1}>
                {user?.user_metadata?.full_name || 
                 user?.displayName || 
                 user?.email?.split('@')[0] || 
                 'Gallery Creator'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}> {/* Increased top margin */}
                <View style={{ alignItems: 'center', marginRight: 24 }}> {/* Increased margin */}
                  <Text style={{
                    color: theme.primary,
                    fontSize: width < 375 ? 18 : width < 414 ? 20 : 24, // Restored larger size
                    fontWeight: '800',
                  }}>
                    {galleryCount}
                  </Text>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: width < 375 ? 10 : width < 414 ? 11 : 12, // Restored size
                    fontWeight: '500',
                  }}>
                    Photos
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    color: theme.primary,
                    fontSize: width < 375 ? 18 : width < 414 ? 20 : 24, // Restored larger size
                    fontWeight: '800',
                  }}>
                    {captionedCount}
                  </Text>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: width < 375 ? 10 : width < 414 ? 11 : 12, // Restored size
                    fontWeight: '500',
                  }}>
                    Captioned
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '12%' }}> {/* Reduced minWidth to give more space to user section */}
            <TouchableOpacity
              onPress={onSearchPress}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 20, // Restored larger radius
                padding: 10, // Restored padding
                marginRight: 8, // Restored margin
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="search" size={20} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onLogoutPress}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 20,
                padding: 10,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};