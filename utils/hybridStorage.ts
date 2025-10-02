import { GalleryItem, StorageService } from './storage';
import SupabaseGalleryService from './supabaseService';

export class HybridStorageService {
  // Load items from local storage first, then sync with cloud
  static async loadGalleryItems(userId?: string): Promise<GalleryItem[]> {
    try {
      // Always load from local storage first for fast loading
      const localItems = await StorageService.loadGalleryItems();
      
      // If user is logged in, try to sync with cloud
      if (userId) {
        try {
          const cloudItems = await SupabaseGalleryService.getGalleryItems();
          const convertedCloudItems: GalleryItem[] = cloudItems.map(item => ({
            id: item.id.toString(), // Convert number id to string for local compatibility
            imageUri: item.image_url,
            caption: item.caption || '',
            timestamp: new Date(item.created_at).getTime(),
            cloudSynced: true, // Mark as synced
          }));

          // Merge local and cloud items, prioritizing cloud data
          const mergedItems = this.mergeItems(localItems, convertedCloudItems);
          
          // Update local storage with merged data
          await StorageService.saveGalleryItems(mergedItems);
          
          return mergedItems;
        } catch (error) {
          console.log('Cloud sync failed, using local data:', error);
          return localItems;
        }
      }
      
      return localItems;
    } catch (error) {
      console.error('Error loading gallery items:', error);
      return [];
    }
  }

  // Add item to both local and cloud storage
  static async addGalleryItem(item: GalleryItem, userId?: string): Promise<GalleryItem> {
    try {
      // Always save to local storage first
      await StorageService.addGalleryItem(item);
      
      // If user is logged in, try to upload to cloud
      if (userId) {
        try {
          // Generate unique filename
          const fileName = `image_${Date.now()}.jpg`;
          
          // Upload image to cloud storage
          const uploadedImageUrl = await SupabaseGalleryService.uploadImage(item.imageUri, fileName);
          
          if (uploadedImageUrl) {
            // Save record to cloud database
            const cloudItem = await SupabaseGalleryService.addGalleryItem(uploadedImageUrl, item.caption);
            
            if (cloudItem) {
              // Update local item with cloud data
              const syncedItem: GalleryItem = {
                id: cloudItem.id.toString(),
                imageUri: cloudItem.image_url,
                caption: cloudItem.caption || '',
                timestamp: new Date(cloudItem.created_at).getTime(),
                cloudSynced: true,
              };
              
              // Update local storage with cloud-synced version
              await StorageService.updateGalleryItem(syncedItem);
              return syncedItem;
            }
          }
        } catch (error) {
          console.log('Cloud upload failed, item saved locally only:', error);
          // Mark as not synced
          const localItem = { ...item, cloudSynced: false };
          await StorageService.updateGalleryItem(localItem);
          return localItem;
        }
      }
      
      return { ...item, cloudSynced: false };
    } catch (error) {
      console.error('Error adding gallery item:', error);
      throw error;
    }
  }

  // Update item caption in both local and cloud
  static async updateGalleryItem(item: GalleryItem, userId?: string): Promise<boolean> {
    try {
      // Update local storage
      await StorageService.updateGalleryItem(item);
      
      // If user is logged in and item is cloud-synced, update cloud
      if (userId && item.cloudSynced) {
        try {
          await SupabaseGalleryService.updateGalleryItem(parseInt(item.id), item.caption); // Convert string to number
        } catch (error) {
          console.log('Cloud update failed:', error);
          // Mark as not synced
          const unsyncedItem = { ...item, cloudSynced: false };
          await StorageService.updateGalleryItem(unsyncedItem);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating gallery item:', error);
      return false;
    }
  }

  // Delete item from both local and cloud
  static async deleteGalleryItem(item: GalleryItem, userId?: string): Promise<boolean> {
    try {
      // Delete from local storage
      await StorageService.deleteGalleryItem(item.id);
      
      // If user is logged in and item is cloud-synced, delete from cloud
      if (userId && item.cloudSynced) {
        try {
          await SupabaseGalleryService.deleteGalleryItem(parseInt(item.id)); // Convert string to number
        } catch (error) {
          console.log('Cloud delete failed:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      return false;
    }
  }

  // Merge local and cloud items, avoiding duplicates
  private static mergeItems(localItems: GalleryItem[], cloudItems: GalleryItem[]): GalleryItem[] {
    const merged = new Map<string, GalleryItem>();
    
    // Add local items first
    localItems.forEach(item => {
      merged.set(item.id, item);
    });
    
    // Add cloud items, overwriting local if they exist
    cloudItems.forEach(item => {
      merged.set(item.id, item);
    });
    
    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Extend the GalleryItem interface to include sync status
declare module './storage' {
  interface GalleryItem {
    cloudSynced?: boolean;
  }
}