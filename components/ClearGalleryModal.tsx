import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';
import BackupStorageService from '../utils/backupStorageService';
import { StorageService } from '../utils/storage';

const { width, height } = Dimensions.get('window');

interface ClearGalleryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ClearGalleryModal: React.FC<ClearGalleryModalProps> = ({ visible, onClose, onSuccess }) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [galleryStats, setGalleryStats] = useState({
    localItems: 0,
    cloudItems: 0,
    recycleBinItems: 0
  });
  const [selectedOption, setSelectedOption] = useState<string>('local-only');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadGalleryStats();
      getCurrentUser();
    }
  }, [visible]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadGalleryStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get local items
      const localItems = await StorageService.loadGalleryItems();
      const activeLocalItems = localItems.filter(item => !item.isDeletedLocally);
      
      // Get cloud items if user is logged in
      let cloudItemsCount = 0;
      let recycleBinCount = 0;
      
      if (user) {
        try {
          const { data: cloudItems } = await supabase
            .from('gallery_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted_locally', false);
            
          const { data: recycleBinItems } = await supabase
            .from('gallery_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted_locally', true);

          cloudItemsCount = cloudItems?.length || 0;
          recycleBinCount = recycleBinItems?.length || 0;
        } catch (error) {
          console.log('Error loading cloud stats:', error);
        }
      }

      setGalleryStats({
        localItems: activeLocalItems.length,
        cloudItems: cloudItemsCount,
        recycleBinItems: recycleBinCount
      });
    } catch (error) {
      console.error('Error loading gallery stats:', error);
    }
  };

  const clearOptions = [
    {
      id: 'local-only',
      title: 'Clear Local Photos Only',
      subtitle: 'Keep cloud backup safe',
      description: 'Remove photos from this device but keep them in the cloud',
      icon: 'phone-portrait',
      color: theme.primary,
      risk: 'low'
    },
    {
      id: 'recycle-bin',
      title: 'Empty Recycle Bin',
      subtitle: 'Permanently delete',
      description: 'Remove all items from recycle bin permanently',
      icon: 'trash',
      color: theme.warning,
      risk: 'medium'
    },
    {
      id: 'everything',
      title: 'Clear Everything',
      subtitle: 'Local + Cloud + Recycle Bin',
      description: 'Permanently delete all photos from everywhere',
      icon: 'nuclear',
      color: theme.error,
      risk: 'high'
    }
  ];

  const handleClearGallery = async () => {
    const option = clearOptions.find(opt => opt.id === selectedOption);
    if (!option) return;

    const confirmationMessage = selectedOption === 'everything' 
      ? 'This will permanently delete ALL your photos from this device, cloud, and recycle bin. This action cannot be undone!'
      : selectedOption === 'recycle-bin'
      ? 'This will permanently delete all items in the recycle bin. This action cannot be undone!'
      : 'This will remove photos from this device but keep them safe in the cloud.';

    Alert.alert(
      `${option.title}?`,
      confirmationMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: selectedOption === 'everything' ? 'Delete Everything' : 'Continue',
          style: selectedOption === 'everything' ? 'destructive' : 'default',
          onPress: async () => {
            if (selectedOption === 'everything') {
              // Extra confirmation for nuclear option
              Alert.alert(
                'Final Confirmation',
                'Are you absolutely sure? This will delete everything permanently!',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes, Delete Everything',
                    style: 'destructive',
                    onPress: performClearAction
                  }
                ]
              );
            } else {
              performClearAction();
            }
          }
        }
      ]
    );
  };

  const performClearAction = async () => {
    try {
      setIsLoading(true);
      
      switch (selectedOption) {
        case 'local-only':
          await StorageService.clearGallery();
          Alert.alert(
            'Local Gallery Cleared',
            'Photos removed from device but kept safe in cloud backup.',
            [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }]
          );
          break;
          
        case 'recycle-bin':
          if (user) {
            // Get all recycle bin items
            const recycleBinItems = await BackupStorageService.loadRecycleBinItems(user.id);
            const itemIds = recycleBinItems.map(item => parseInt(item.id));
            
            if (itemIds.length > 0) {
              await BackupStorageService.emptyRecycleBin(itemIds, user.id);
            }
          }
          Alert.alert(
            'Recycle Bin Emptied',
            'All items in recycle bin have been permanently deleted.',
            [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }]
          );
          break;
          
        case 'everything':
          // Clear local storage
          await StorageService.clearGallery();
          
          // Clear cloud storage if user is logged in
          if (user) {
            const { error } = await supabase
              .from('gallery_items')
              .delete()
              .eq('user_id', user.id);
              
            if (error) {
              console.error('Error clearing cloud storage:', error);
              throw error;
            }
          }
          
          Alert.alert(
            'Everything Cleared',
            'All photos have been permanently deleted from everywhere.',
            [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }]
          );
          break;
      }
    } catch (error) {
      console.error('Error during clear operation:', error);
      Alert.alert('Error', 'Failed to clear gallery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ClearOption = ({ option }: { option: typeof clearOptions[0] }) => {
    const isSelected = selectedOption === option.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.clearOption,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? option.color : theme.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => setSelectedOption(option.id)}
      >
        <View style={styles.optionContent}>
          <View style={[
            styles.optionIcon,
            {
              backgroundColor: isSelected ? option.color + '20' : theme.backgroundSecondary
            }
          ]}>
            <Ionicons
              name={option.icon as any}
              size={24}
              color={isSelected ? option.color : theme.textSecondary}
            />
          </View>
          
          <View style={styles.optionText}>
            <Text style={[
              styles.optionTitle,
              {
                color: theme.text,
                fontWeight: isSelected ? '600' : '500'
              }
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.optionSubtitle,
              { color: theme.textSecondary }
            ]}>
              {option.subtitle}
            </Text>
            <Text style={[
              styles.optionDescription,
              { color: theme.textTertiary }
            ]}>
              {option.description}
            </Text>
            
            <View style={[
              styles.riskBadge,
              {
                backgroundColor: option.risk === 'high' ? theme.error + '20' :
                                 option.risk === 'medium' ? theme.warning + '20' :
                                 theme.success + '20'
              }
            ]}>
              <Text style={[
                styles.riskText,
                {
                  color: option.risk === 'high' ? theme.error :
                         option.risk === 'medium' ? theme.warning :
                         theme.success
                }
              ]}>
                {option.risk === 'high' ? '⚠️ High Risk' :
                 option.risk === 'medium' ? '🔶 Medium Risk' :
                 '✅ Safe'}
              </Text>
            </View>
          </View>
          
          {isSelected && (
            <View style={[
              styles.selectedIndicator,
              { backgroundColor: option.color }
            ]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
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
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Clear Gallery
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Choose what to remove
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={[styles.statsOverview, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Current Gallery Status
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>
                  {galleryStats.localItems}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Local Photos
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.success }]}>
                  {galleryStats.cloudItems}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Cloud Backup
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.warning }]}>
                  {galleryStats.recycleBinItems}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Recycle Bin
                </Text>
              </View>
            </View>
          </View>

          {/* Clear Options */}
          <View style={styles.optionsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Clear Options
            </Text>
            {clearOptions.map((option) => (
              <ClearOption key={option.id} option={option} />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: selectedOption === 'everything' ? theme.error :
                               selectedOption === 'recycle-bin' ? theme.warning :
                               theme.primary,
                opacity: isLoading ? 0.6 : 1
              }
            ]}
            onPress={handleClearGallery}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons 
                  name={selectedOption === 'everything' ? 'nuclear' : 'trash'} 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.actionButtonText}>
                  {clearOptions.find(opt => opt.id === selectedOption)?.title}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsOverview: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionsSection: {
    marginBottom: 32,
  },
  clearOption: {
    borderRadius: 16,
    marginBottom: 12,
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ClearGalleryModal;