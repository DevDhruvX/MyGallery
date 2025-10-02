import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { FOLDER_COLORS, FOLDER_ICONS, Folder } from '../utils/folderStorage';

const { width } = Dimensions.get('window');

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'photoCount'>) => Promise<void>;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  onClose,
  onCreateFolder,
}) => {
  const { theme } = useTheme();
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    if (folderName.trim().length > 30) {
      Alert.alert('Error', 'Folder name must be 30 characters or less');
      return;
    }

    try {
      setIsCreating(true);
      await onCreateFolder({
        name: folderName.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
      
      // Reset form
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0]);
      setSelectedIcon(FOLDER_ICONS[0]);
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  };

  const renderColorOption = ({ item: color }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorOption,
        { backgroundColor: color },
        selectedColor === color && styles.selectedColorOption,
      ]}
      onPress={() => setSelectedColor(color)}
    >
      {selectedColor === color && (
        <Ionicons name="checkmark" size={16} color="white" />
      )}
    </TouchableOpacity>
  );

  const renderIconOption = ({ item: icon }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.iconOption,
        { 
          backgroundColor: selectedIcon === icon ? selectedColor + '20' : theme.surface,
          borderColor: selectedIcon === icon ? selectedColor : theme.border,
        },
      ]}
      onPress={() => setSelectedIcon(icon)}
    >
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={selectedIcon === icon ? selectedColor : theme.text} 
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Folder</Text>
          
          <TouchableOpacity 
            onPress={handleCreate} 
            style={[
              styles.headerButton,
              styles.createButton,
              { backgroundColor: selectedColor },
            ]}
            disabled={isCreating || !folderName.trim()}
          >
            <Text style={styles.createButtonText}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Folder Preview */}
          <View style={styles.previewSection}>
            <View style={[styles.folderPreview, { backgroundColor: selectedColor + '20' }]}>
              <View style={[styles.folderIcon, { backgroundColor: selectedColor }]}>
                <Ionicons name={selectedIcon as any} size={32} color="white" />
              </View>
            </View>
            <Text style={[styles.previewName, { color: theme.text }]}>
              {folderName || 'Folder Name'}
            </Text>
          </View>

          {/* Folder Name Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Folder Name</Text>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }
              ]}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Enter folder name"
              placeholderTextColor={theme.textSecondary}
              maxLength={30}
              autoFocus={true}
            />
            <Text style={[styles.characterCount, { color: theme.textTertiary }]}>
              {folderName.length}/30
            </Text>
          </View>

          {/* Color Selection */}
          <View style={styles.colorSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Folder Color</Text>
            <FlatList
              data={FOLDER_COLORS}
              renderItem={renderColorOption}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorList}
            />
          </View>

          {/* Icon Selection */}
          <View style={styles.iconSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Folder Icon</Text>
            <FlatList
              data={FOLDER_ICONS}
              renderItem={renderIconOption}
              keyExtractor={(item) => item}
              numColumns={5}
              contentContainerStyle={styles.iconGrid}
            />
          </View>
        </View>
      </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  cancelText: {
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  folderPreview: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  colorSection: {
    marginBottom: 30,
  },
  colorList: {
    paddingVertical: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    transform: [{ scale: 1.1 }],
  },
  iconSection: {
    flex: 1,
  },
  iconGrid: {
    paddingVertical: 8,
  },
  iconOption: {
    width: (width - 80) / 5,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginRight: 8,
  },
});

export default CreateFolderModal;