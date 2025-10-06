import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BackupSyncModal from '../components/BackupSyncModal';
import ClearGalleryModal from '../components/ClearGalleryModal';
import EditProfileModal from '../components/EditProfileModal';
import ThemeSettingsModal from '../components/ThemeSettingsModal';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';

const { width, height } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [galleryStats, setGalleryStats] = useState({ total: 0, captioned: 0 });
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showBackupSync, setShowBackupSync] = useState(false);
  const [showClearGallery, setShowClearGallery] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Get current user and gallery stats
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getCurrentUser();
    getGalleryStats();
  }, []);

  const getGalleryStats = async () => {
    try {
      const { StorageService } = await import('../utils/storage');
      const items = await StorageService.loadGalleryItems();
      setGalleryStats({
        total: items.length,
        captioned: items.filter((item: any) => item.caption).length
      });
    } catch (error) {
      console.log('Error getting gallery stats:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Simple sign out - app will require fresh login on next visit anyway
              await supabase.auth.signOut({ scope: 'global' });
              console.log('Signed out successfully');
              // Navigation will automatically handle redirect to login
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const clearGallery = () => {
    setShowClearGallery(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
        translucent={Platform.OS === 'android'}
      />
      
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={[theme.primary + '15', theme.background]}
          style={styles.headerGradient}
        >
          <View style={styles.modernHeader}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ 
                    uri: user?.user_metadata?.avatar_url || 
                         user?.photoURL || 
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=random&color=fff&size=120`
                  }}
                  style={[styles.modernAvatar, {
                    width: width < 375 ? 80 : 100,
                    height: width < 375 ? 80 : 100,
                    borderRadius: width < 375 ? 40 : 50,
                  }]}
                />
                <View style={[styles.onlineIndicator, { 
                  backgroundColor: theme.success,
                  width: width < 375 ? 16 : 20,
                  height: width < 375 ? 16 : 20,
                  borderRadius: width < 375 ? 8 : 10,
                }]} />
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[styles.displayName, { 
                  color: theme.text,
                  fontSize: width < 375 ? 22 : 28,
                }]}>
                  {user?.user_metadata?.full_name || 
                   user?.displayName || 
                   user?.email?.split('@')[0] || 
                   'Gallery Creator'}
                </Text>
                <Text style={[styles.userEmail, { 
                  color: theme.textSecondary,
                  fontSize: width < 375 ? 14 : 16,
                }]}>
                  {user?.email}
                </Text>
                <Text style={[styles.joinDate, { 
                  color: theme.textTertiary,
                  fontSize: width < 375 ? 12 : 14,
                }]}>
                  Member since {new Date(user?.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { 
            color: theme.text,
            fontSize: width < 375 ? 18 : 20,
          }]}>
            Gallery Statistics
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="images" size={width < 375 ? 20 : 24} color={theme.primary} />
              </View>
              <Text style={[styles.statNumber, { 
                color: theme.text,
                fontSize: width < 375 ? 24 : 28,
              }]}>
                {galleryStats.total}
              </Text>
              <Text style={[styles.statLabel, { 
                color: theme.textSecondary,
                fontSize: width < 375 ? 12 : 14,
              }]}>
                Total Photos
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.accent + '20' }]}>
                <Ionicons name="chatbubbles" size={width < 375 ? 20 : 24} color={theme.accent} />
              </View>
              <Text style={[styles.statNumber, { 
                color: theme.text,
                fontSize: width < 375 ? 24 : 28,
              }]}>
                {galleryStats.captioned}
              </Text>
              <Text style={[styles.statLabel, { 
                color: theme.textSecondary,
                fontSize: width < 375 ? 12 : 14,
              }]}>
                With Captions
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.settingsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { 
            color: theme.text,
            fontSize: width < 375 ? 18 : 20,
          }]}>
            Settings & Actions
          </Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={() => setShowThemeSettings(true)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="color-palette" size={width < 375 ? 18 : 20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { 
                  color: theme.text,
                  fontSize: width < 375 ? 14 : 16,
                }]}>
                  Theme Settings
                </Text>
                <Text style={[styles.settingSubtitle, { 
                  color: theme.textSecondary,
                  fontSize: width < 375 ? 11 : 12,
                }]}>
                  Customize your app appearance
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={width < 375 ? 16 : 18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={() => setShowBackupSync(true)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="cloud-upload" size={width < 375 ? 18 : 20} color={theme.success} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { 
                  color: theme.text,
                  fontSize: width < 375 ? 14 : 16,
                }]}>
                  Backup & Sync
                </Text>
                <Text style={[styles.settingSubtitle, { 
                  color: theme.textSecondary,
                  fontSize: width < 375 ? 11 : 12,
                }]}>
                  Keep your photos safe in the cloud
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={width < 375 ? 16 : 18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={() => setShowEditProfile(true)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="person-circle" size={width < 375 ? 18 : 20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { 
                  color: theme.text,
                  fontSize: width < 375 ? 14 : 16,
                }]}>
                  Edit Profile
                </Text>
                <Text style={[styles.settingSubtitle, { 
                  color: theme.textSecondary,
                  fontSize: width < 375 ? 11 : 12,
                }]}>
                  Update your profile info and photo
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={width < 375 ? 16 : 18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={clearGallery}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.warning + '20' }]}>
                <Ionicons name="trash" size={width < 375 ? 18 : 20} color={theme.warning} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { 
                  color: theme.warning,
                  fontSize: width < 375 ? 14 : 16,
                }]}>
                  Clear Gallery
                </Text>
                <Text style={[styles.settingSubtitle, { 
                  color: theme.textSecondary,
                  fontSize: width < 375 ? 11 : 12,
                }]}>
                  Remove all photos permanently
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={width < 375 ? 16 : 18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.error + '20' }]}>
                <Ionicons name="log-out" size={width < 375 ? 18 : 20} color={theme.error} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { 
                  color: theme.error,
                  fontSize: width < 375 ? 14 : 16,
                }]}>
                  Sign Out
                </Text>
                <Text style={[styles.settingSubtitle, { 
                  color: theme.textSecondary,
                  fontSize: width < 375 ? 11 : 12,
                }]}>
                  You'll need to sign in again
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={width < 375 ? 16 : 18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.appInfoSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { 
            color: theme.text,
            fontSize: width < 375 ? 18 : 20,
          }]}>
            About
          </Text>
          
          <View style={styles.appInfoContent}>
            <LinearGradient
              colors={[theme.primary, theme.accent]}
              style={styles.appIconGradient}
            >
              <Ionicons name="camera" size={width < 375 ? 24 : 30} color="white" />
            </LinearGradient>
            
            <View style={styles.appDetails}>
              <Text style={[styles.appName, { 
                color: theme.text,
                fontSize: width < 375 ? 18 : 22,
              }]}>
                My Gallery
              </Text>
              <Text style={[styles.appVersion, { 
                color: theme.textSecondary,
                fontSize: width < 375 ? 12 : 14,
              }]}>
                Version 1.0.0
              </Text>
              <Text style={[styles.appDescription, { 
                color: theme.textTertiary,
                fontSize: width < 375 ? 11 : 12,
              }]}>
                A modern cross-platform gallery app with voice captions and intelligent organization
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        }}
        user={user}
      />

      {/* Theme Settings Modal */}
      <ThemeSettingsModal
        visible={showThemeSettings}
        onClose={() => setShowThemeSettings(false)}
      />

      {/* Backup & Sync Modal */}
      <BackupSyncModal
        visible={showBackupSync}
        onClose={() => setShowBackupSync(false)}
      />

      {/* Clear Gallery Modal */}
      <ClearGalleryModal
        visible={showClearGallery}
        onClose={() => setShowClearGallery(false)}
        onSuccess={getGalleryStats}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  modernHeader: {
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  modernAvatar: {
    borderWidth: 4,
    borderColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  displayName: {
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    marginBottom: 8,
    textAlign: 'center',
  },
  joinDate: {
    textAlign: 'center',
  },
  statsSection: {
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: width < 375 ? 16 : 20,
    padding: width < 375 ? 20 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: width < 375 ? 16 : 20,
    borderRadius: width < 375 ? 12 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconContainer: {
    width: width < 375 ? 40 : 48,
    height: width < 375 ? 40 : 48,
    borderRadius: width < 375 ? 20 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    fontWeight: '500',
  },
  settingsSection: {
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: width < 375 ? 16 : 20,
    padding: width < 375 ? 4 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: width < 375 ? 16 : 20,
    paddingHorizontal: width < 375 ? 16 : 20,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: width < 375 ? 36 : 44,
    height: width < 375 ? 36 : 44,
    borderRadius: width < 375 ? 18 : 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    opacity: 0.8,
  },
  appInfoSection: {
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: width < 375 ? 16 : 20,
    padding: width < 375 ? 20 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconGradient: {
    width: width < 375 ? 50 : 60,
    height: width < 375 ? 50 : 60,
    borderRadius: width < 375 ? 25 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    marginBottom: 6,
  },
  appDescription: {
    lineHeight: width < 375 ? 16 : 18,
  },
  errorText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ProfileScreen;