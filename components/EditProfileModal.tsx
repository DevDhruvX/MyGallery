import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';

const { width } = Dimensions.get('window');

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  user: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose, onSave, user }) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user && visible) {
      setDisplayName(user.user_metadata?.full_name || user.displayName || '');
      setAvatarUri(user.user_metadata?.avatar_url || user.photoURL || '');
      setHasChanges(false);
    }
  }, [user, visible]);

  const handleInputChange = (field: string, value: string) => {
    setHasChanges(true);
    switch (field) {
      case 'displayName':
        setDisplayName(value);
        break;
    }
  };

  // Create stable handlers to prevent re-rendering
  const handleDisplayNameChange = React.useCallback((text: string) => {
    setDisplayName(text);
    setHasChanges(true);
  }, []);

  const removePhoto = () => {
    Alert.alert(
      'Remove Profile Photo',
      'Are you sure you want to remove your profile photo? You can always add a new one later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAvatarUri('');
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to change your profile photo.');
        return;
      }

      Alert.alert(
        'Select Photo',
        'Choose how you want to select your profile photo',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Photo Library',
            onPress: () => openImagePicker(),
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera permissions to take your photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);

      let avatarUrl = avatarUri;

      // Upload profile image to Supabase Storage if a new image was selected
      if (avatarUri && avatarUri.startsWith('file://')) {
        try {
          let fileData;
          
          if (Platform.OS === 'web') {
            // Web platform - use blob
            const response = await fetch(avatarUri);
            fileData = await response.blob();
          } else {
            // Mobile platforms - use FileSystem to read as arrayBuffer
            const response = await fetch(avatarUri);
            const arrayBuffer = await response.arrayBuffer();
            fileData = new Uint8Array(arrayBuffer);
          }
          
          const fileExt = 'jpg';
          const fileName = `${user.id}/profile.${fileExt}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(fileName, fileData, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'image/jpeg'
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);

          avatarUrl = urlData.publicUrl;
        } catch (imageError) {
          console.error('Error uploading profile image:', imageError);
          Alert.alert('Image Upload Failed', 'Your profile info will be saved, but the image upload failed. Please try again.');
          // Continue with saving other profile data
          avatarUrl = user?.user_metadata?.avatar_url || '';
        }
      }

      // Update user metadata in Supabase Auth
      const updates = {
        data: {
          full_name: displayName.trim(),
          avatar_url: avatarUrl,
        }
      };

      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        throw error;
      }

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated and synced across all devices!',
        [{ text: 'OK', onPress: () => { onSave(); onClose(); } }]
      );

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      supportedOrientations={['portrait']}
    >
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={onClose}
            disabled={isLoading}
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Edit Profile
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: hasChanges ? theme.primary : theme.backgroundSecondary,
                opacity: isLoading ? 0.6 : 1,
              }
            ]}
            onPress={handleSave}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[
                styles.saveButtonText,
                { color: hasChanges ? 'white' : theme.textSecondary }
              ]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.scrollInner}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Profile Photo
            </Text>
            
            <View style={styles.photoContainer}>
              <TouchableOpacity
                style={[styles.photoWrapper, { borderColor: theme.border }]}
                onPress={pickImage}
                disabled={isLoading}
              >
                <Image
                  source={{
                    uri: avatarUri ||
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || user?.email || 'User')}&background=random&color=fff&size=120`
                  }}
                  style={styles.profilePhoto}
                />
                <View style={[styles.photoOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <Ionicons name="camera" size={24} color="white" />
                  <Text style={styles.photoOverlayText}>Change Photo</Text>
                </View>
              </TouchableOpacity>
              
              {/* Remove Photo Button - only show if user has a custom avatar */}
              {avatarUri && !avatarUri.includes('ui-avatars.com') && avatarUri.trim() !== '' && (
                <TouchableOpacity
                  style={[styles.removePhotoButton, { 
                    backgroundColor: theme.error + '15',
                    borderColor: theme.error + '30',
                  }]}
                  onPress={removePhoto}
                  disabled={isLoading}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.error} />
                  <Text style={[styles.removePhotoText, { color: theme.error }]}>
                    Remove Photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Profile Information
            </Text>

            {/* Display Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Display Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.border,
                  }
                ]}
                value={displayName}
                onChangeText={handleDisplayNameChange}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                maxLength={50}
                autoCapitalize="words"
                autoCorrect={true}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              <Text style={[styles.characterCount, { color: theme.textTertiary }]}>
                {displayName.length}/50
              </Text>
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
              <View style={[
                styles.textInput,
                styles.readOnlyInput,
                { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }
              ]}>
                <Text style={[styles.readOnlyText, { color: theme.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
          </View>
        </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollInner: {
    flex: 1,
  },
  photoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
    borderWidth: 3,
    borderRadius: 75,
    padding: 3,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoOverlay: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  photoOverlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  infoSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textInputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  readOnlyInput: {
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 16,
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  removePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default EditProfileModal;