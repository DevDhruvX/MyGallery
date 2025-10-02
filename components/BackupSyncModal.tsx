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

const { width, height } = Dimensions.get('window');

interface BackupSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

const BackupSyncModal: React.FC<BackupSyncModalProps> = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [backupStats, setBackupStats] = useState({
    localItems: 0,
    cloudItems: 0,
    lastBackup: null as Date | null,
    storageUsed: 0
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadBackupStats();
      getCurrentUser();
    }
  }, [visible]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadBackupStats = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get local items
      const localItems = await BackupStorageService.loadActiveItems(user?.id);
      
      // Get cloud items from Supabase
      const { data: cloudItems } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('user_id', user?.id);

      // Get last backup time
      const { data: lastBackupData } = await supabase
        .from('gallery_items')
        .select('created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      setBackupStats({
        localItems: localItems.length,
        cloudItems: cloudItems?.length || 0,
        lastBackup: lastBackupData?.[0]?.created_at ? new Date(lastBackupData[0].created_at) : null,
        storageUsed: Math.random() * 100 // Placeholder for storage calculation
      });
    } catch (error) {
      console.error('Error loading backup stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setIsLoading(true);
      Alert.alert(
        'Backup Started',
        'Your photos are being backed up to the cloud. This may take a few minutes.',
        [{ text: 'OK' }]
      );
      
      // Force sync all local items to cloud
      await BackupStorageService.syncToCloud(user?.id);
      await loadBackupStats();
      
      Alert.alert(
        'Backup Complete',
        'All your photos have been successfully backed up to the cloud.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error during backup:', error);
      Alert.alert('Backup Failed', 'There was an error backing up your photos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    Alert.alert(
      'Restore from Cloud',
      'This will download all your photos from the cloud. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Download and restore from cloud
              await BackupStorageService.restoreFromCloud(user?.id);
              await loadBackupStats();
              
              Alert.alert(
                'Restore Complete',
                'All your photos have been restored from the cloud.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error during restore:', error);
              Alert.alert('Restore Failed', 'There was an error restoring your photos. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ icon, title, value, subtitle, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
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
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Backup & Sync
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Keep your photos safe in the cloud
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Storage Overview
            </Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                icon="phone-portrait"
                title="Local Photos"
                value={backupStats.localItems}
                subtitle="On this device"
                color={theme.primary}
              />
              <StatCard
                icon="cloud"
                title="Cloud Photos"
                value={backupStats.cloudItems}
                subtitle="Backed up"
                color={theme.success}
              />
            </View>
            
            <View style={styles.statsGrid}>
              <StatCard
                icon="time"
                title="Last Backup"
                value={backupStats.lastBackup ? 
                  backupStats.lastBackup.toLocaleDateString() : 'Never'}
                subtitle={backupStats.lastBackup ? 
                  backupStats.lastBackup.toLocaleTimeString() : 'No backups yet'}
                color={theme.accent}
              />
              <StatCard
                icon="server"
                title="Storage Used"
                value={`${backupStats.storageUsed.toFixed(1)} MB`}
                subtitle="Of cloud storage"
                color={theme.warning}
              />
            </View>
          </View>

          {/* Backup Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Backup Actions
            </Text>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                { 
                  backgroundColor: theme.primary,
                  opacity: isLoading ? 0.6 : 1
                }
              ]}
              onPress={handleBackupNow}
              disabled={isLoading}
            >
              <View style={styles.actionContent}>
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="cloud-upload" size={24} color="white" />
                )}
                <Text style={styles.actionText}>Backup Now</Text>
                <Text style={styles.actionSubtext}>
                  Upload all local photos to cloud
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { 
                  backgroundColor: theme.success,
                  opacity: isLoading ? 0.6 : 1
                }
              ]}
              onPress={handleRestoreFromCloud}
              disabled={isLoading}
            >
              <View style={styles.actionContent}>
                <Ionicons name="cloud-download" size={24} color="white" />
                <Text style={styles.actionText}>Restore from Cloud</Text>
                <Text style={styles.actionSubtext}>
                  Download all cloud photos to device
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.backgroundSecondary }
              ]}
              onPress={loadBackupStats}
            >
              <View style={styles.actionContent}>
                <Ionicons name="refresh" size={24} color={theme.text} />
                <Text style={[styles.actionText, { color: theme.text }]}>
                  Refresh Status
                </Text>
                <Text style={[styles.actionSubtext, { color: theme.textSecondary }]}>
                  Update backup information
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
            <View style={[styles.infoIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                About Cloud Backup
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Your photos are securely stored in the cloud and can be accessed from any device. 
                All backups are encrypted and only accessible with your account.
              </Text>
            </View>
          </View>
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
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
  actionContent: {
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  actionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
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
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BackupSyncModal;