import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';
import BackupStorageService from '../utils/backupStorageService';
import { GalleryItem } from '../utils/storage';

const { width } = Dimensions.get('window');

const BackupManagerScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'recycle' | 'backup'>('recycle');
  const [recycleBinItems, setRecycleBinItems] = useState<GalleryItem[]>([]);
  const [backupItems, setBackupItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadData();
      }
    };
    getCurrentUser();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (activeTab === 'recycle') {
        const items = await BackupStorageService.loadRecycleBinItems(user.id);
        setRecycleBinItems(items);
      } else {
        const items = await BackupStorageService.loadAllBackupItems(user.id);
        setBackupItems(items);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [activeTab, user]);

  const handleRestore = async (item: GalleryItem) => {
    if (!user) return;

    try {
      let success = false;
      
      if (activeTab === 'recycle') {
        success = await BackupStorageService.restoreFromRecycleBin(item, user.id);
      } else {
        success = await BackupStorageService.restoreFromBackup(item, user.id);
      }

      if (success) {
        Alert.alert('✅ Restored', 'Photo has been restored to your gallery!');
        loadData();
      } else {
        Alert.alert('❌ Error', 'Failed to restore photo');
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      Alert.alert('❌ Error', 'Failed to restore photo');
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (!user || recycleBinItems.length === 0) return;

    Alert.alert(
      '🗑️ Empty Recycle Bin',
      'This will permanently delete all items in recycle bin. They will still be available in backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Bin',
          style: 'destructive',
          onPress: async () => {
            try {
              const itemIds = recycleBinItems.map(item => parseInt(item.id));
              const success = await BackupStorageService.emptyRecycleBin(itemIds, user.id);
              
              if (success) {
                Alert.alert('✅ Done', 'Recycle bin emptied. Items are still in backup.');
                loadData();
              } else {
                Alert.alert('❌ Error', 'Failed to empty recycle bin');
              }
            } catch (error) {
              console.error('Error emptying recycle bin:', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: theme.surface }]}
      onPress={() => handleRestore(item)}
    >
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.itemContent}>
        <Text style={[styles.caption, { color: theme.text }]} numberOfLines={2}>
          {item.caption || 'No caption'}
        </Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        {item.isPermanentlyDeleted && (
          <Text style={[styles.status, { color: '#FF6B6B' }]}>Permanently Deleted</Text>
        )}
        {item.isDeletedLocally && !item.isPermanentlyDeleted && (
          <Text style={[styles.status, { color: '#FFA500' }]}>In Recycle Bin</Text>
        )}
      </View>
      <Ionicons name="arrow-undo" size={24} color={theme.primary} />
    </TouchableOpacity>
  );

  const currentItems = activeTab === 'recycle' ? recycleBinItems : backupItems;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Backup Manager</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'recycle' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('recycle')}
        >
          <Ionicons 
            name="trash" 
            size={20} 
            color={activeTab === 'recycle' ? 'white' : theme.textSecondary} 
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'recycle' ? 'white' : theme.textSecondary },
            ]}
          >
            Recycle Bin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'backup' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('backup')}
        >
          <Ionicons 
            name="cloud" 
            size={20} 
            color={activeTab === 'backup' ? 'white' : theme.textSecondary} 
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'backup' ? 'white' : theme.textSecondary },
            ]}
          >
            Full Backup
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Button */}
      {activeTab === 'recycle' && recycleBinItems.length > 0 && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={handleEmptyRecycleBin}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.actionButtonText}>Empty Recycle Bin</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <FlatList
        data={currentItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'recycle' ? 'trash' : 'cloud'} 
              size={80} 
              color={theme.textSecondary} 
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {activeTab === 'recycle' 
                ? 'Recycle bin is empty' 
                : 'No backup items found'
              }
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={loadData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  caption: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default BackupManagerScreen;