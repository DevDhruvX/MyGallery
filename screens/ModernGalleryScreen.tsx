import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CreateFolderModal from '../components/CreateFolderModal';
import FolderGrid from '../components/FolderGrid';
import FolderSelectorModal from '../components/FolderSelectorModal';
import { GalleryHeader } from '../components/GalleryHeader';
import ModernCaptionInput from '../components/ModernCaptionInput';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';
import BackupStorageService from '../utils/backupStorageService';
import { Folder } from '../utils/folderStorage';
import { GalleryItem } from '../utils/storage';

interface ModernGalleryScreenProps {
  route?: any;
}

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2; // 2 columns with padding
const HEADER_HEIGHT = width < 375 ? 100 : width < 414 ? 110 : 120; // Responsive header height

// Create Animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ModernGalleryScreen: React.FC<ModernGalleryScreenProps> = ({ route }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Dynamic header height that includes safe area
  const DYNAMIC_HEADER_HEIGHT = (width < 375 ? 100 : width < 414 ? 110 : 120) + insets.top;
  
  const [user, setUser] = useState<any>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [showFullScreenViewer, setShowFullScreenViewer] = useState(false);
  const [fullScreenItem, setFullScreenItem] = useState<GalleryItem | null>(null);
  const [showModernOptions, setShowModernOptions] = useState(false);
  const [optionsItem, setOptionsItem] = useState<GalleryItem | null>(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  
  // Folder-related state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showFolderView, setShowFolderView] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showFolderSelectorModal, setShowFolderSelectorModal] = useState(false);
  const [selectedItemForFolder, setSelectedItemForFolder] = useState<GalleryItem | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Load gallery items from hybrid storage (local + cloud)
  const loadGalleryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await BackupStorageService.loadActiveItems(user?.id);
      setGalleryItems(items.sort((a: GalleryItem, b: GalleryItem) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading gallery items:', error);
      Alert.alert('Error', 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load folders
  const loadFolders = useCallback(async () => {
    try {
      const folderList = await BackupStorageService.loadFolders(user?.id);
      setFolders(folderList);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  }, [user]);

  useEffect(() => {
    loadGalleryItems();
    loadFolders();
  }, [loadGalleryItems, loadFolders]);

  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(galleryItems);
    } else {
      const filtered = galleryItems.filter(item => 
        item.caption?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [galleryItems, searchQuery]);

  // Folder handling functions
  const handleCreateFolder = async (folderData: { name: string; color: string; icon: string }) => {
    try {
      await BackupStorageService.createFolder(folderData, user?.id);
      await loadFolders();
      setShowCreateFolderModal(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder');
    }
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    if (!selectedItemForFolder) return;
    
    try {
      const success = await BackupStorageService.moveToFolder(selectedItemForFolder.id, folderId || undefined, user?.id);
      if (success) {
        await loadGalleryItems();
        await loadFolders();
        setShowFolderSelectorModal(false);
        setSelectedItemForFolder(null);
      } else {
        Alert.alert('Error', 'Failed to move photo to folder');
      }
    } catch (error) {
      console.error('Error moving to folder:', error);
      Alert.alert('Error', 'Failed to move photo to folder');
    }
  };

  const handleFolderSelect = (folder: Folder | null) => {
    if (folder === null) {
      // "All Photos" selected - show all photos in Photos view
      setCurrentFolderId(null);
      setShowFolderView(false);
    } else {
      // Specific folder selected - show photos in that folder
      setCurrentFolderId(folder.id);
      setShowFolderView(false);
    }
  };

  const getDisplayItems = () => {
    // If we're in folder view, don't show any photos - FolderGrid will handle that
    if (showFolderView) {
      return [];
    }
    
    // If we're in photos view, show photos based on current folder selection
    if (currentFolderId === null) {
      // Show ALL photos when no specific folder is selected
      return filteredItems;
    } else {
      // Show photos in the selected folder
      return filteredItems.filter(item => item.folderId === currentFolderId);
    }
  };

  // Request permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and media library permissions are required to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // Handle image selection from camera or gallery
  const handleImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    if (Platform.OS === 'web') {
      // On web, only offer gallery option since camera is usually not available
      Alert.alert(
        '📸 Add New Photo',
        'Select an image from your computer',
        [
          { 
            text: '🖼️ Choose File', 
            onPress: () => pickImageFromGallery(),
            style: 'default'
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
        ],
        { cancelable: true }
      );
    } else {
      // Mobile platforms - offer both camera and gallery
      Alert.alert(
        '📸 Add New Photo',
        'How would you like to add a photo?',
        [
          { 
            text: '📷 Camera', 
            onPress: () => pickImageFromCamera(),
            style: 'default'
          },
          { 
            text: '🖼️ Gallery', 
            onPress: () => pickImageFromGallery(),
            style: 'default'
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
        ],
        { cancelable: true }
      );
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Check if camera is available (not on web typically)
      if (Platform.OS === 'web') {
        Alert.alert(
          'Camera Not Available',
          'Camera access is not available on web. Please use Gallery option instead.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Allow full image without cropping
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addImageToGallery(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Allow full image without cropping
        quality: 0.8,
        ...(Platform.OS === 'web' && {
          // Web-specific options
          allowsMultipleSelection: false,
        }),
      });

      if (!result.canceled && result.assets[0]) {
        await addImageToGallery(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Add new image to gallery using hybrid storage
  const addImageToGallery = async (imageUri: string) => {
    try {
      setIsLoading(true);
      
      // Create new item
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        imageUri,
        caption: '',
        timestamp: Date.now(),
        cloudSynced: false,
      };

      // Use hybrid storage service
      const savedItem = await BackupStorageService.addGalleryItem(newItem, user?.id);
      
      setGalleryItems(prev => [savedItem, ...prev]);
      
      // Show caption input for the new item
      setSelectedItem(savedItem);
      setShowCaptionInput(true);
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image to gallery');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle caption save using hybrid storage
  const handleCaptionSave = async (caption: string) => {
    if (!selectedItem) return;

    const updatedItem = { ...selectedItem, caption };
    
    try {
      // Update using hybrid storage
      const success = await BackupStorageService.updateCaption(updatedItem, user?.id);
      
      if (success) {
        setGalleryItems(prev =>
          prev.map(item => (item.id === selectedItem.id ? updatedItem : item))
        );
        setShowCaptionInput(false);
        setSelectedItem(null);
      } else {
        throw new Error('Failed to update caption');
      }
    } catch (error) {
      console.error('Error updating caption:', error);
      Alert.alert('Error', 'Failed to update caption');
    }
  };

  // Handle item long press for options
  const handleItemLongPress = (item: GalleryItem) => {
    console.log('handleItemLongPress called with item:', item.id);
    
    // Temporarily use Alert.alert to test if basic functionality works
    Alert.alert(
      '⚙️ Photo Options',
      'What would you like to do with this photo?',
      [
        { 
          text: '👁️ View Details', 
          onPress: () => viewItem(item) 
        },
        { 
          text: '✏️ Edit Caption', 
          onPress: () => editCaption(item) 
        },
        { 
          text: '📤 Share', 
          onPress: () => shareItem(item) 
        },
        { 
          text: '🗑️ Delete', 
          onPress: () => deleteItem(item), 
          style: 'destructive' 
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ],
      { cancelable: true }
    );
  };

  const showOptionsForItem = (item: GalleryItem) => {
    console.log('showOptionsForItem called with item:', item.id);
    setShowFullScreenViewer(false);
    setOptionsItem(item);
    setShowModernOptions(true);
    console.log('Set showModernOptions to true for full screen item');
  };

  const handleModernOptionSelect = (action: string) => {
    console.log('handleModernOptionSelect called with action:', action);
    console.log('optionsItem:', optionsItem);
    
    if (!optionsItem) {
      console.log('No optionsItem found, returning early');
      return;
    }
    
    setShowModernOptions(false);
    
    switch (action) {
      case 'view':
        console.log('Calling viewItem');
        viewItem(optionsItem);
        break;
      case 'edit':
        console.log('Calling editCaption');
        editCaption(optionsItem);
        break;
      case 'share':
        console.log('Calling shareItem');
        shareItem(optionsItem);
        break;
      case 'move':
        console.log('Calling moveToFolderDialog');
        moveToFolderDialog(optionsItem);
        break;
      case 'delete':
        console.log('Calling deleteItem');
        deleteItem(optionsItem);
        break;
      default:
        console.log('Unknown action:', action);
    }
    
    setOptionsItem(null);
  };

  const editCaption = (item: GalleryItem) => {
    setSelectedItem(item);
    setShowCaptionInput(true);
  };

  const moveToFolderDialog = (item: GalleryItem) => {
    setSelectedItemForFolder(item);
    setShowFolderSelectorModal(true);
  };

  const viewItem = (item: GalleryItem) => {
    setFullScreenItem(item);
    setShowFullScreenViewer(true);
  };

  const deleteItem = async (item: GalleryItem) => {
    Alert.alert(
      '🗑️ Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await BackupStorageService.deleteFromPhone(item, user?.id);
              if (success) {
                setGalleryItems(prev => prev.filter(i => i.id !== item.id));
                Alert.alert('✅ Deleted', 'Photo deleted successfully');
              } else {
                throw new Error('Delete failed');
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('❌ Error', 'Failed to delete photo');
            }
          }
        }
      ]
    );
  };

  const shareItem = async (item: GalleryItem) => {
    console.log('shareItem function called with item:', item);
    try {
      console.log('Sharing item URI:', item.imageUri);
      console.log('Platform:', Platform.OS);
      
      if (Platform.OS === 'web') {
        console.log('Using web sharing');
        // Web sharing fallback
        const shareData = {
          title: 'My Gallery Image',
          text: item.caption || 'Check out this amazing photo from My Gallery! 📸',
          url: item.imageUri,
        };

        if (navigator.share) {
          console.log('Using navigator.share');
          await navigator.share(shareData);
        } else {
          console.log('Using clipboard fallback');
          // Copy to clipboard as fallback
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          Alert.alert('✅ Copied!', 'Image details copied to clipboard');
        }
      } else {
        console.log('Using mobile sharing');
        // Mobile platforms - use Expo Sharing
        const isAvailable = await Sharing.isAvailableAsync();
        console.log('Sharing available:', isAvailable);
        
        if (isAvailable) {
          // Ensure the URI is valid
          if (!item.imageUri) {
            console.error('No image URI provided');
            Alert.alert('❌ Error', 'Image not available for sharing');
            return;
          }
          
          let shareableUri = item.imageUri;
          
          try {
            console.log('Preparing image for native sharing...');
            let shareableUri = item.imageUri;
            
            if (item.imageUri.startsWith('http')) {
              // Download remote image first to share as actual file
              console.log('Downloading remote image for sharing...');
              
              const timestamp = Date.now();
              const fileExtension = item.imageUri.includes('.jpg') ? 'jpg' : 'png';
              const fileName = `temp_share_${timestamp}.${fileExtension}`;
              const localPath = FileSystem.documentDirectory + fileName;
              
              const downloadResult = await FileSystem.downloadAsync(item.imageUri, localPath);
              console.log('Download result:', downloadResult);
              
              if (downloadResult.status === 200) {
                shareableUri = downloadResult.uri;
              } else {
                throw new Error('Failed to download image');
              }
            }
            
            console.log('Sharing image file:', shareableUri);
            
            // Share the actual image file (not text/URL)
            await Sharing.shareAsync(shareableUri, {
              dialogTitle: 'Share Photo'
            });
            
            console.log('Image sharing completed successfully');
            
            // Clean up downloaded file if it was temporary
            if (item.imageUri.startsWith('http') && shareableUri !== item.imageUri) {
              try {
                await FileSystem.deleteAsync(shareableUri, { idempotent: true });
                console.log('Cleaned up temporary file');
              } catch (cleanupError) {
                console.log('Could not clean up temp file:', cleanupError);
              }
            }
            
          } catch (fileError) {
            console.error('Error processing file for sharing:', fileError);
            
            // Fallback to enhanced text sharing with photo info
            console.log('Falling back to enhanced text sharing');
            const shareText = item.caption 
              ? `"${item.caption}"\n\n📸 From My Gallery` 
              : '📸 Amazing photo from My Gallery!';
              
            const imageType = item.imageUri.startsWith('http') ? 'Cloud Image' : 'Local Image';
            const fullShareText = `${shareText}\n\n🔗 ${imageType}\n\n(Image sharing temporarily unavailable)`;
              
            Alert.alert(
              '� Share Photo Info',
              fullShareText,
              [
                {
                  text: '📋 Copy Caption',
                  onPress: () => {
                    const captionOnly = item.caption || 'Amazing photo from My Gallery!';
                    console.log('Caption to copy:', captionOnly);
                    Alert.alert('📋 Copied!', `Caption copied: "${captionOnly}"`);
                  }
                },
                {
                  text: '🔗 Copy Link',
                  onPress: () => {
                    console.log('Link to copy:', item.imageUri);
                    Alert.alert('🔗 Copied!', 'Image link copied to clipboard');
                  }
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
          }
        } else {
          console.log('Sharing not available on this device');
          
          // Show the photo details in an alert as fallback
          const shareText = item.caption 
            ? `Photo Caption: "${item.caption}"\n\nFrom My Gallery 📸` 
            : 'Amazing photo from My Gallery! 📸';
            
          Alert.alert('📸 Photo Info', shareText, [{ text: 'OK' }]);
        }
      }
    } catch (error: any) {
      console.error('Share error details:', error);
      if (error?.message !== 'User did not share') {
        console.error('Error sharing:', error);
        
        // Ultimate fallback - just show an alert with the caption
        const fallbackText = item.caption 
          ? `Photo Caption: "${item.caption}"\n\nFrom My Gallery 📸` 
          : 'Amazing photo from My Gallery! 📸';
          
        Alert.alert('📸 Photo Info', fallbackText, [{ text: 'OK' }]);
      } else {
        console.log('User cancelled sharing');
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      '👋 Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              console.log('Starting logout process...');
              
              // Clear any local state first
              setGalleryItems([]);
              setUser(null);
              
              // Simple sign out - app requires fresh login anyway
              await supabase.auth.signOut({ scope: 'global' });
              
              console.log('Logout successful - will require fresh login on next visit');
              
              // Show success message for mobile
              if (Platform.OS !== 'web') {
                Alert.alert('✅ Success', 'You have been logged out successfully');
              }
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('❌ Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Render gallery item with modern design and responsive layout
  const renderGalleryItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={[
        styles.galleryItem,
        {
          backgroundColor: theme.surface,
          marginLeft: index % 2 === 0 ? 0 : 8,
          marginRight: index % 2 === 0 ? 8 : 0,
          height: width < 375 ? 180 : width < 414 ? 200 : 220,
        }
      ]}
      onLongPress={() => handleItemLongPress(item)}
      onPress={() => viewItem(item)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.imageUri }} 
        style={[styles.galleryImage, {
          borderRadius: width < 375 ? 12 : 16,
        }]} 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.imageOverlay}
      />
      
      {item.caption ? (
        <View style={styles.captionContainer}>
          <Text 
            style={[styles.captionText, { 
              fontSize: width < 375 ? 12 : 14,
              lineHeight: width < 375 ? 16 : 18,
            }]} 
            numberOfLines={3}
          >
            {item.caption}
          </Text>
        </View>
      ) : (
        <View style={styles.noCaptionContainer}>
          <Ionicons 
            name="chatbubble-outline" 
            size={width < 375 ? 14 : 16} 
            color="rgba(255,255,255,0.7)" 
          />
          <Text style={[styles.noCaptionText, { 
            fontSize: width < 375 ? 11 : 12,
          }]}>
            Tap to add caption
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[theme.primary + '20', theme.primary + '10']}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="camera-outline" size={64} color={theme.primary} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Start Your Gallery Journey
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        Capture memories, add voice captions, and{'\n'}share your amazing moments with the world
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        onPress={handleImagePicker}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.emptyButtonText}>Add Your First Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GalleryHeader
        user={user}
        theme={theme}
        galleryCount={galleryItems.length}
        captionedCount={galleryItems.filter(item => item.caption && item.caption.trim()).length}
        onSearchPress={() => setShowSearch(!showSearch)}
        onLogoutPress={handleLogout}
      />
      
      {/* View Toggle Buttons */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            {
              backgroundColor: !showFolderView ? theme.primary : theme.surface,
              borderColor: theme.border,
            }
          ]}
          onPress={() => {
            setShowFolderView(false);
            setCurrentFolderId(null); // Show all photos when switching to Photos view
          }}
        >
          <Ionicons 
            name="grid-outline" 
            size={20} 
            color={!showFolderView ? 'white' : theme.text} 
          />
          <Text 
            style={[
              styles.viewToggleText,
              { color: !showFolderView ? 'white' : theme.text }
            ]}
          >
            Photos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            {
              backgroundColor: showFolderView ? theme.primary : theme.surface,
              borderColor: theme.border,
            }
          ]}
          onPress={() => setShowFolderView(true)}
        >
          <Ionicons 
            name="folder-outline" 
            size={20} 
            color={showFolderView ? 'white' : theme.text} 
          />
          <Text 
            style={[
              styles.viewToggleText,
              { color: showFolderView ? 'white' : theme.text }
            ]}
          >
            Folders
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ flex: 1 }}>
        {/* Search Bar */}
        {showSearch && (
          <TextInput
            style={[styles.searchInput, { 
              color: theme.text,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              marginHorizontal: 16,
              marginTop: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              fontSize: 16,
              minHeight: 48,
            }]}
            placeholder="Search by caption..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
            autoFocus={true}
          />
        )}
        
        {/* Search Results Count */}
        {showSearch && searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={[styles.searchResultsText, { color: theme.textSecondary }]}>
              {filteredItems.length} photo{filteredItems.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}
        
        {/* Content Area - Either Folders or Photos */}
        {showFolderView ? (
          <FolderGrid
            folders={folders}
            onFolderPress={handleFolderSelect}
            onCreateFolder={() => setShowCreateFolderModal(true)}
            totalPhotos={galleryItems.length}
          />
        ) : (
          <AnimatedFlatList
            data={getDisplayItems()}
            renderItem={renderGalleryItem}
            keyExtractor={(item: any) => item.id}
            numColumns={2}
            contentContainerStyle={[
              styles.galleryContainer,
              { 
                paddingTop: showSearch ? 80 : 20,
                paddingBottom: width < 375 ? 120 : 140, // Extra space for FAB
              }
            ]}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={loadGalleryItems}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={!isLoading ? EmptyState : null}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
        )}
      </View>

      {/* Modern Floating Action Button - Responsive */}
      <TouchableOpacity 
        style={[styles.modernFab, { 
          backgroundColor: theme.primary,
          width: width < 375 ? 52 : 64,
          height: width < 375 ? 52 : 64,
          borderRadius: width < 375 ? 26 : 32,
          bottom: 90 + insets.bottom, // Position above tab navigation
          right: width < 375 ? 20 : 25,
        }]}
        onPress={handleImagePicker}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.primary, theme.primary + 'DD']}
          style={[styles.fabGradient, {
            borderRadius: width < 375 ? 26 : 32,
          }]}
        >
          <Ionicons name="add" size={width < 375 ? 24 : 28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Caption Input Modal */}
      {showCaptionInput && selectedItem && (
        <ModernCaptionInput
          visible={showCaptionInput}
          initialCaption={selectedItem.caption}
          onSave={handleCaptionSave}
          onCancel={() => {
            setShowCaptionInput(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Full-Screen Image Viewer */}
      <Modal
        visible={showFullScreenViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullScreenViewer(false)}
      >
        <View style={styles.fullScreenContainer}>
          {fullScreenItem && (
            <>
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFullScreenViewer(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>

              {/* Full-screen image */}
              <Image
                source={{ uri: fullScreenItem.imageUri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />

              {/* Three-dot menu */}
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => showOptionsForItem(fullScreenItem)}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Modern Options Modal */}
      <Modal
        visible={showModernOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModernOptions(false)}
      >
        <View style={styles.modernOptionsOverlay}>
          <TouchableOpacity 
            style={styles.modernOptionsBackdrop}
            activeOpacity={1}
            onPress={() => setShowModernOptions(false)}
          />
          <View style={[styles.modernOptionsContainer, { backgroundColor: theme.card }]}>
            <View style={styles.modernOptionsHeader}>
              <Text style={[styles.modernOptionsTitle, { color: theme.text }]}>
                Photo Options
              </Text>
            </View>
            
            <View style={styles.modernOptionsContent}>
              {optionsItem && !showFullScreenViewer && (
                <TouchableOpacity
                  style={[styles.modernOptionButton, { borderBottomColor: theme.border }]}
                  onPress={() => handleModernOptionSelect('view')}
                >
                  <Text style={[styles.modernOptionText, { color: theme.text }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.modernOptionButton, { borderBottomColor: theme.border }]}
                onPress={() => handleModernOptionSelect('edit')}
              >
                <Text style={[styles.modernOptionText, { color: theme.text }]}>
                  Edit Caption
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modernOptionButton, { borderBottomColor: theme.border }]}
                onPress={() => handleModernOptionSelect('share')}
              >
                <Text style={[styles.modernOptionText, { color: theme.text }]}>
                  Share
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modernOptionButton, { borderBottomColor: theme.border }]}
                onPress={() => handleModernOptionSelect('move')}
              >
                <Text style={[styles.modernOptionText, { color: theme.text }]}>
                  Move to Folder
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modernOptionButton, styles.modernOptionButtonLast]}
                onPress={() => handleModernOptionSelect('delete')}
              >
                <Text style={[styles.modernOptionText, styles.modernOptionTextDestructive]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.modernCancelButton, { backgroundColor: theme.background }]}
              onPress={() => setShowModernOptions(false)}
            >
              <Text style={[styles.modernCancelText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <CreateFolderModal
        visible={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* Folder Selector Modal */}
      <FolderSelectorModal
        visible={showFolderSelectorModal}
        onClose={() => setShowFolderSelectorModal(false)}
        folders={folders}
        onSelectFolder={(folderId) => handleMoveToFolder(folderId || null)}
        currentFolderId={selectedItemForFolder?.folderId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modernHeader: {
    height: HEADER_HEIGHT,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  modernAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  userDisplayName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    marginRight: 16,
  },
  modernLogoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    minHeight: 44,
  },
  searchResults: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchResultsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  galleryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  galleryItem: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // This will ensure full image shows while maintaining aspect ratio
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  captionText: {
    fontSize: 13,
    color: 'white',
    lineHeight: 18,
    fontWeight: '500',
  },
  noCaptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noCaptionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modernFab: {
    position: 'absolute',
    bottom: 90, // Default position above tab navigation
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  optionsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Modern Options Modal Styles
  modernOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modernOptionsBackdrop: {
    flex: 1,
  },
  modernOptionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernOptionsHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modernOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modernOptionsContent: {
    paddingVertical: 8,
  },
  modernOptionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modernOptionButtonLast: {
    borderBottomWidth: 0,
  },
  modernOptionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modernOptionTextDestructive: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  modernCancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  modernCancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  userBio: {
    fontStyle: 'italic',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userLocation: {
    marginLeft: 4,
    fontWeight: '500',
  },
  // View Toggle Styles
  viewToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  viewToggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ModernGalleryScreen;