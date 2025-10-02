import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Folder } from '../utils/folderStorage';

const { width } = Dimensions.get('window');
const FOLDER_SIZE = (width - 60) / 2; // 2 columns with padding

interface FolderGridProps {
  folders: Folder[];
  onFolderPress: (folder: Folder | null) => void;
  onFolderLongPress?: (folder: Folder) => void;
  onCreateFolder: () => void;
  totalPhotos: number;
}

const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  onFolderPress,
  onFolderLongPress,
  onCreateFolder,
  totalPhotos,
}) => {
  const { theme } = useTheme();

  const renderAllPhotosFolder = () => (
    <TouchableOpacity
      style={[styles.folderCard, { backgroundColor: theme.surface }]}
      onPress={() => onFolderPress(null)}
    >
      <View style={[styles.folderIcon, { backgroundColor: theme.primary }]}>
        <Ionicons name="images" size={32} color="white" />
      </View>
      <Text style={[styles.folderName, { color: theme.text }]} numberOfLines={1}>
        All Photos
      </Text>
      <Text style={[styles.folderCount, { color: theme.textSecondary }]}>
        {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );

  const renderCreateFolderCard = () => (
    <TouchableOpacity
      style={[
        styles.folderCard,
        styles.createFolderCard,
        { 
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderStyle: 'dashed',
        }
      ]}
      onPress={onCreateFolder}
    >
      <View style={[styles.createIcon, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name="add" size={28} color={theme.primary} />
      </View>
      <Text style={[styles.folderName, { color: theme.primary }]}>
        New Folder
      </Text>
      <Text style={[styles.folderCount, { color: theme.textSecondary }]}>
        Create folder
      </Text>
    </TouchableOpacity>
  );

  const renderFolderCard = ({ item: folder }: { item: Folder }) => (
    <TouchableOpacity
      style={[styles.folderCard, { backgroundColor: theme.surface }]}
      onPress={() => onFolderPress(folder)}
      onLongPress={() => onFolderLongPress?.(folder)}
    >
      <View style={[styles.folderIcon, { backgroundColor: folder.color }]}>
        <Ionicons name={folder.icon as any} size={32} color="white" />
      </View>
      <Text style={[styles.folderName, { color: theme.text }]} numberOfLines={1}>
        {folder.name}
      </Text>
      <Text style={[styles.folderCount, { color: theme.textSecondary }]}>
        {folder.photoCount} photo{folder.photoCount !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );

  const data = [
    { type: 'all-photos', id: 'all-photos' },
    { type: 'create-folder', id: 'create-folder' },
    ...folders.map(folder => ({ type: 'folder', ...folder })),
  ];

  const renderItem = ({ item }: any) => {
    switch (item.type) {
      case 'all-photos':
        return renderAllPhotosFolder();
      case 'create-folder':
        return renderCreateFolderCard();
      case 'folder':
        return renderFolderCard({ item });
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Folders
      </Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    paddingBottom: 16,
  },
  folderCard: {
    width: FOLDER_SIZE,
    height: FOLDER_SIZE * 0.85,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createFolderCard: {
    borderWidth: 2,
  },
  folderIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  createIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default FolderGrid;