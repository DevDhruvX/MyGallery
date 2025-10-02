import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GalleryItem {
  id: string;
  imageUri: string;
  caption: string;
  timestamp: number;
  folderId?: string; // Optional folder ID for organization
  cloudSynced?: boolean; // For cloud sync compatibility
}

const GALLERY_STORAGE_KEY = '@MyGallery:items';

export const StorageService = {
  // Save gallery items to local storage
  async saveGalleryItems(items: GalleryItem[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(items);
      await AsyncStorage.setItem(GALLERY_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving gallery items:', error);
      throw error;
    }
  },

  // Load gallery items from local storage
  async loadGalleryItems(): Promise<GalleryItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(GALLERY_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading gallery items:', error);
      return [];
    }
  },

  // Add a new gallery item
  async addGalleryItem(item: GalleryItem): Promise<void> {
    try {
      const existingItems = await this.loadGalleryItems();
      const updatedItems = [...existingItems, item];
      await this.saveGalleryItems(updatedItems);
    } catch (error) {
      console.error('Error adding gallery item:', error);
      throw error;
    }
  },

  // Update an existing gallery item
  async updateGalleryItem(updatedItem: GalleryItem): Promise<void> {
    try {
      const existingItems = await this.loadGalleryItems();
      const updatedItems = existingItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      await this.saveGalleryItems(updatedItems);
    } catch (error) {
      console.error('Error updating gallery item:', error);
      throw error;
    }
  },

  // Delete a gallery item
  async deleteGalleryItem(itemId: string): Promise<void> {
    try {
      const existingItems = await this.loadGalleryItems();
      const filteredItems = existingItems.filter(item => item.id !== itemId);
      await this.saveGalleryItems(filteredItems);
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      throw error;
    }
  },

  // Clear all gallery items
  async clearGallery(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GALLERY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing gallery:', error);
      throw error;
    }
  }
};