import EnhancedSupabaseService from './enhancedSupabaseService';
import { Folder, FolderStorageService } from './folderStorage';
import { GalleryItem, StorageService } from './storage';

export class BackupStorageService {
  // Load active items (not deleted from phone)
  static async loadActiveItems(userId?: string): Promise<GalleryItem[]> {
    try {
      // Load from local storage first
      const localItems = await StorageService.loadGalleryItems();
      const activeLocalItems = localItems.filter(item => !item.isDeletedLocally);
      
      // If user is logged in, sync with cloud
      if (userId) {
        try {
          const cloudItems = await EnhancedSupabaseService.getActiveItems();
          const convertedCloudItems: GalleryItem[] = cloudItems.map(item => ({
            id: item.id.toString(),
            imageUri: item.image_url,
            caption: item.caption || '',
            timestamp: new Date(item.created_at).getTime(),
            cloudSynced: true,
          }));

          // Merge and update local storage
          const mergedItems = this.mergeItems(activeLocalItems, convertedCloudItems);
          await this.saveActiveItemsLocally(mergedItems);
          
          return mergedItems;
        } catch (error) {
          console.log('Cloud sync failed, using local data:', error);
          return activeLocalItems;
        }
      }
      
      return activeLocalItems;
    } catch (error) {
      console.error('Error loading active items:', error);
      return [];
    }
  }

  // Load recycle bin items
  static async loadRecycleBinItems(userId: string): Promise<GalleryItem[]> {
    try {
      const cloudItems = await EnhancedSupabaseService.getRecycleBinItems();
      return cloudItems.map(item => ({
        id: item.id.toString(),
        imageUri: item.image_url,
        caption: item.caption || '',
        timestamp: new Date(item.deleted_locally_at || item.created_at).getTime(),
        cloudSynced: true,
        isDeletedLocally: true,
      }));
    } catch (error) {
      console.error('Error loading recycle bin items:', error);
      return [];
    }
  }

  // Load all backup items (for full restore)
  static async loadAllBackupItems(userId: string): Promise<GalleryItem[]> {
    try {
      const cloudItems = await EnhancedSupabaseService.getAllBackupItems();
      return cloudItems.map(item => ({
        id: item.id.toString(),
        imageUri: item.image_url,
        caption: item.caption || '',
        timestamp: new Date(item.created_at).getTime(),
        cloudSynced: true,
        isDeletedLocally: item.is_deleted_locally,
        isPermanentlyDeleted: item.is_permanently_deleted,
      }));
    } catch (error) {
      console.error('Error loading backup items:', error);
      return [];
    }
  }

  // === FOLDER MANAGEMENT METHODS ===

  // Load folders
  static async loadFolders(userId?: string): Promise<Folder[]> {
    try {
      return await FolderStorageService.loadFolders();
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
  }

  // Create new folder
  static async createFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'photoCount'>, userId?: string): Promise<Folder> {
    try {
      const newFolder = await FolderStorageService.createFolder(folderData);
      
      // TODO: Add cloud sync for folders when implementing cloud folder support
      // if (userId) {
      //   try {
      //     await EnhancedSupabaseService.createFolder(newFolder);
      //   } catch (error) {
      //     console.log('Failed to sync folder to cloud:', error);
      //   }
      // }
      
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  // Update folder
  static async updateFolder(folderId: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>, userId?: string): Promise<void> {
    try {
      await FolderStorageService.updateFolder(folderId, updates);
      
      // TODO: Add cloud sync for folder updates
      // if (userId) {
      //   try {
      //     await EnhancedSupabaseService.updateFolder(folderId, updates);
      //   } catch (error) {
      //     console.log('Failed to sync folder update to cloud:', error);
      //   }
      // }
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  }

  // Delete folder
  static async deleteFolder(folderId: string, userId?: string): Promise<void> {
    try {
      // Move all photos from this folder to "All Photos" (no folder)
      const allItems = await StorageService.loadGalleryItems();
      const folderItems = allItems.filter(item => item.folderId === folderId);
      
      for (const item of folderItems) {
        const updatedItem = { ...item, folderId: undefined };
        await StorageService.updateGalleryItem(updatedItem);
      }

      // Delete the folder
      await FolderStorageService.deleteFolder(folderId);
      
      // TODO: Add cloud sync for folder deletion
      // if (userId) {
      //   try {
      //     await EnhancedSupabaseService.deleteFolder(folderId);
      //   } catch (error) {
      //     console.log('Failed to sync folder deletion to cloud:', error);
      //   }
      // }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  // Move photo to folder
  static async moveToFolder(itemId: string, folderId: string | undefined, userId?: string): Promise<boolean> {
    try {
      const allItems = await StorageService.loadGalleryItems();
      const item = allItems.find(item => item.id === itemId);
      
      if (!item) {
        throw new Error('Item not found');
      }

      const updatedItem = { ...item, folderId };
      await StorageService.updateGalleryItem(updatedItem);
      
      // Update folder photo counts
      await this.updateFolderCounts();
      
      // TODO: Add cloud sync for item folder assignment
      // if (userId && item.cloudSynced) {
      //   try {
      //     await EnhancedSupabaseService.updateItemFolder(parseInt(itemId), folderId);
      //   } catch (error) {
      //     console.log('Failed to sync item folder change to cloud:', error);
      //   }
      // }
      
      return true;
    } catch (error) {
      console.error('Error moving item to folder:', error);
      return false;
    }
  }

  // Get items by folder
  static async getItemsByFolder(folderId?: string, userId?: string): Promise<GalleryItem[]> {
    try {
      const allItems = await this.loadActiveItems(userId);
      
      if (!folderId) {
        // Return items not in any folder (All Photos)
        return allItems.filter(item => !item.folderId);
      }
      
      return allItems.filter(item => item.folderId === folderId);
    } catch (error) {
      console.error('Error getting items by folder:', error);
      return [];
    }
  }

  // Update folder photo counts
  static async updateFolderCounts(): Promise<void> {
    try {
      const allItems = await StorageService.loadGalleryItems();
      const activeItems = allItems.filter(item => !item.isDeletedLocally);
      const folders = await FolderStorageService.loadFolders();
      
      for (const folder of folders) {
        const count = activeItems.filter(item => item.folderId === folder.id).length;
        await FolderStorageService.updatePhotoCount(folder.id, count);
      }
    } catch (error) {
      console.error('Error updating folder counts:', error);
    }
  }

  // Override addGalleryItem to support folders
  static async addGalleryItem(item: GalleryItem, userId?: string, folderId?: string): Promise<GalleryItem> {
    try {
      // Add folder ID if provided
      const itemWithFolder = folderId ? { ...item, folderId } : item;
      
      // Save to local storage first
      await StorageService.addGalleryItem(itemWithFolder);
      
      // If user is logged in, upload to cloud
      if (userId) {
        try {
          const fileName = `image_${Date.now()}.jpg`;
          const uploadedImageUrl = await EnhancedSupabaseService.uploadImage(itemWithFolder.imageUri, fileName);
          
          if (uploadedImageUrl) {
            const cloudItem = await EnhancedSupabaseService.addGalleryItem(uploadedImageUrl, itemWithFolder.caption);
            
            if (cloudItem) {
              const syncedItem: GalleryItem = {
                id: cloudItem.id.toString(),
                imageUri: cloudItem.image_url,
                caption: cloudItem.caption || '',
                timestamp: new Date(cloudItem.created_at).getTime(),
                folderId: itemWithFolder.folderId,
                cloudSynced: true,
              };
              
              await StorageService.updateGalleryItem(syncedItem);
              
              // Update folder counts
              await this.updateFolderCounts();
              
              return syncedItem;
            }
          }
        } catch (error) {
          console.log('Cloud upload failed, item saved locally only:', error);
        }
      }
      
      // Update folder counts
      await this.updateFolderCounts();
      
      return { ...itemWithFolder, cloudSynced: false };
    } catch (error) {
      console.error('Error adding gallery item:', error);
      throw error;
    }
  }

  // Delete from phone only (move to recycle bin in cloud)
  static async deleteFromPhone(item: GalleryItem, userId?: string): Promise<boolean> {
    try {
      // Remove from local storage (delete from phone)
      await StorageService.deleteGalleryItem(item.id);
      
      // If synced to cloud, move to recycle bin (don't delete from cloud)
      if (userId && item.cloudSynced) {
        try {
          await EnhancedSupabaseService.moveToRecycleBin(parseInt(item.id));
        } catch (error) {
          console.log('Failed to move to cloud recycle bin:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting from phone:', error);
      return false;
    }
  }

  // Restore from recycle bin
  static async restoreFromRecycleBin(item: GalleryItem, userId: string): Promise<boolean> {
    try {
      // Restore in cloud
      const success = await EnhancedSupabaseService.restoreFromRecycleBin(parseInt(item.id));
      
      if (success) {
        // Add back to local storage
        const restoredItem = { ...item, isDeletedLocally: false };
        await StorageService.addGalleryItem(restoredItem);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error restoring from recycle bin:', error);
      return false;
    }
  }

  // Empty recycle bin (permanent delete)
  static async emptyRecycleBin(itemIds: number[], userId: string): Promise<boolean> {
    try {
      const results = await Promise.all(
        itemIds.map(id => EnhancedSupabaseService.permanentDelete(id))
      );
      
      return results.every(result => result);
    } catch (error) {
      console.error('Error emptying recycle bin:', error);
      return false;
    }
  }

  // Restore from backup (even permanently deleted)
  static async restoreFromBackup(item: GalleryItem, userId: string): Promise<boolean> {
    try {
      const success = await EnhancedSupabaseService.restoreFromBackup(parseInt(item.id));
      
      if (success) {
        const restoredItem = { 
          ...item, 
          isDeletedLocally: false, 
          isPermanentlyDeleted: false 
        };
        await StorageService.addGalleryItem(restoredItem);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  // Update caption
  static async updateCaption(item: GalleryItem, userId?: string): Promise<boolean> {
    try {
      await StorageService.updateGalleryItem(item);
      
      if (userId && item.cloudSynced) {
        await EnhancedSupabaseService.updateCaption(parseInt(item.id), item.caption);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating caption:', error);
      return false;
    }
  }

  // Helper methods
  private static async saveActiveItemsLocally(items: GalleryItem[]): Promise<void> {
    const allLocalItems = await StorageService.loadGalleryItems();
    const deletedLocalItems = allLocalItems.filter(item => item.isDeletedLocally);
    const updatedItems = [...items, ...deletedLocalItems];
    await StorageService.saveGalleryItems(updatedItems);
  }

  private static mergeItems(localItems: GalleryItem[], cloudItems: GalleryItem[]): GalleryItem[] {
    const merged = new Map<string, GalleryItem>();
    
    localItems.forEach(item => merged.set(item.id, item));
    cloudItems.forEach(item => merged.set(item.id, item));
    
    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Sync all local items to cloud
  static async syncToCloud(userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for cloud sync');
    
    try {
      const localItems = await StorageService.loadGalleryItems();
      const activeLocalItems = localItems.filter(item => !item.isDeletedLocally && !item.cloudSynced);
      
      for (const item of activeLocalItems) {
        try {
          // Upload to cloud using addGalleryItem which handles cloud sync
          await this.addGalleryItem(item, userId);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error during cloud sync:', error);
      throw error;
    }
  }

  // Restore all items from cloud
  static async restoreFromCloud(userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for cloud restore');
    
    try {
      const cloudItems = await EnhancedSupabaseService.getActiveItems();
      const convertedCloudItems: GalleryItem[] = cloudItems.map(item => ({
        id: item.id.toString(),
        imageUri: item.image_url,
        caption: item.caption || '',
        timestamp: new Date(item.created_at).getTime(),
        cloudSynced: true,
      }));

      // Get current local items
      const localItems = await StorageService.loadGalleryItems();
      
      // Merge and save
      const mergedItems = this.mergeItems(localItems, convertedCloudItems);
      await StorageService.saveGalleryItems(mergedItems);
    } catch (error) {
      console.error('Error during cloud restore:', error);
      throw error;
    }
  }
}

// Extend the GalleryItem interface
declare module './storage' {
  interface GalleryItem {
    cloudSynced?: boolean;
    isDeletedLocally?: boolean;
    isPermanentlyDeleted?: boolean;
  }
}

export default BackupStorageService;