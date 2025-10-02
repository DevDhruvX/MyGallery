import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Folder } from '../utils/folderStorage';

const { width } = Dimensions.get('window');

interface FolderSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string | undefined) => void;
  folders: Folder[];
  currentFolderId?: string;
  title?: string;
}

const FolderSelectorModal: React.FC<FolderSelectorModalProps> = ({
  visible,
  onClose,
  onSelectFolder,
  folders,
  currentFolderId,
  title = 'Move to Folder',
}) => {
  const { theme } = useTheme();

  const handleSelectFolder = (folderId: string | undefined) => {
    onSelectFolder(folderId);
    onClose();
  };

  const renderFolderItem = ({ item }: { item: Folder }) => {
    const isSelected = item.id === currentFolderId;
    
    return (
      <TouchableOpacity
        style={[
          styles.folderItem,
          {
            backgroundColor: isSelected ? theme.primary + '20' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
          }
        ]}
        onPress={() => handleSelectFolder(item.id)}
        disabled={isSelected}
      >
        <View style={[styles.folderIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={24} color="white" />
        </View>
        
        <View style={styles.folderInfo}>
          <Text style={[styles.folderName, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.folderCount, { color: theme.textSecondary }]}>
            {item.photoCount} photo{item.photoCount !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderAllPhotosItem = () => {
    const isSelected = !currentFolderId;
    
    return (
      <TouchableOpacity
        style={[
          styles.folderItem,
          {
            backgroundColor: isSelected ? theme.primary + '20' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
          }
        ]}
        onPress={() => handleSelectFolder(undefined)}
        disabled={isSelected}
      >
        <View style={[styles.folderIcon, { backgroundColor: theme.primary }]}>
          <Ionicons name="images" size={24} color="white" />
        </View>
        
        <View style={styles.folderInfo}>
          <Text style={[styles.folderName, { color: theme.text }]}>
            All Photos
          </Text>
          <Text style={[styles.folderCount, { color: theme.textSecondary }]}>
            Default gallery
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        )}
      </TouchableOpacity>
    );
  };

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
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
          
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <FlatList
            data={[null, ...folders]} // null represents "All Photos"
            renderItem={({ item }) => {
              if (item === null) {
                return renderAllPhotosItem();
              }
              return renderFolderItem({ item });
            }}
            keyExtractor={(item) => item?.id || 'all-photos'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.folderList}
          />
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
  content: {
    flex: 1,
    paddingTop: 20,
  },
  folderList: {
    paddingHorizontal: 20,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  folderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 13,
  },
});

export default FolderSelectorModal;