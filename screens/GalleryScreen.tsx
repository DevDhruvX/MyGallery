import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CaptionInput from '../components/CaptionInput';
import { supabase } from '../supabaseConfig';
import { GalleryItem, StorageService } from '../utils/storage';

interface GalleryScreenProps {
  // Navigation props will be automatically injected
}

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2; // 2 columns with padding

const GalleryScreen: React.FC<GalleryScreenProps> = () => {
  const [user, setUser] = useState<any>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Load gallery items from storage
  const loadGalleryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await StorageService.loadGalleryItems();
      setGalleryItems(items.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading gallery items:', error);
      Alert.alert('Error', 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGalleryItems();
  }, [loadGalleryItems]);

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

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => pickImageFromCamera() },
        { text: 'Gallery', onPress: () => pickImageFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
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
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addImageToGallery(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Add new image to gallery
  const addImageToGallery = async (imageUri: string) => {
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      imageUri,
      caption: '',
      timestamp: Date.now(),
    };

    try {
      await StorageService.addGalleryItem(newItem);
      setGalleryItems(prev => [newItem, ...prev]);
      
      // Show caption input for the new item
      setSelectedItem(newItem);
      setShowCaptionInput(true);
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image to gallery');
    }
  };

  // Handle caption save
  const handleCaptionSave = async (caption: string) => {
    if (!selectedItem) return;

    const updatedItem = { ...selectedItem, caption };
    
    try {
      await StorageService.updateGalleryItem(updatedItem);
      setGalleryItems(prev =>
        prev.map(item => (item.id === selectedItem.id ? updatedItem : item))
      );
      setShowCaptionInput(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating caption:', error);
      Alert.alert('Error', 'Failed to update caption');
    }
  };

  // Handle item long press for options
  const handleItemLongPress = (item: GalleryItem) => {
    Alert.alert(
      'Options',
      'What would you like to do?',
      [
        { text: 'Edit Caption', onPress: () => editCaption(item) },
        { text: 'Share', onPress: () => shareItem(item) },
        { text: 'Delete', onPress: () => deleteItem(item), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const editCaption = (item: GalleryItem) => {
    setSelectedItem(item);
    setShowCaptionInput(true);
  };

  const shareItem = async (item: GalleryItem) => {
    try {
      if (Platform.OS === 'web') {
        // Web sharing fallback
        const shareData = {
          title: 'My Gallery Image',
          text: item.caption || 'Check out this image from My Gallery!',
          url: item.imageUri,
        };

        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Copy to clipboard as fallback
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          Alert.alert('Copied', 'Image details copied to clipboard');
        }
      } else {
        // Mobile platforms - use Expo Sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(item.imageUri, {
            dialogTitle: 'Share Image',
            mimeType: 'image/jpeg',
          });
        } else {
          Alert.alert('Error', 'Sharing not available on this device');
        }
      }
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Error sharing:', error);
        Alert.alert('Error', 'Failed to share image');
      }
    }
  };

  const deleteItem = (item: GalleryItem) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteGalleryItem(item.id);
              setGalleryItems(prev => prev.filter(i => i.id !== item.id));
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  // Handle logout
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
              await supabase.auth.signOut();
              // Navigation will automatically handle the redirect
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  // Render gallery item
  const renderGalleryItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity
      style={styles.galleryItem}
      onLongPress={() => handleItemLongPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUri }} style={styles.galleryImage} />
      {item.caption ? (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText} numberOfLines={2}>
            {item.caption}
          </Text>
        </View>
      ) : (
        <View style={styles.noCaptionContainer}>
          <Text style={styles.noCaptionText}>Tap to add caption</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.photoURL || 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Gallery Grid */}
      <FlatList
        data={galleryItems}
        renderItem={renderGalleryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.galleryContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadGalleryItems} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No images yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first image
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleImagePicker}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Caption Input Modal */}
      {showCaptionInput && selectedItem && (
        <CaptionInput
          visible={showCaptionInput}
          initialCaption={selectedItem.caption}
          onSave={handleCaptionSave}
          onCancel={() => {
            setShowCaptionInput(false);
            setSelectedItem(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    padding: 8,
  },
  galleryContainer: {
    padding: 16,
    flexGrow: 1,
  },
  galleryItem: {
    width: ITEM_SIZE,
    marginRight: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  galleryImage: {
    width: '100%',
    height: ITEM_SIZE,
  },
  captionContainer: {
    padding: 12,
    minHeight: 60,
  },
  captionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noCaptionContainer: {
    padding: 12,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCaptionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default GalleryScreen;