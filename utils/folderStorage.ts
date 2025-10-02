import AsyncStorage from '@react-native-async-storage/async-storage';

// Folder interface
export interface Folder {
  id: string;
  name: string;
  color: string; // Hex color code for folder theme
  icon: string; // Ionicons icon name
  createdAt: number;
  updatedAt: number;
  photoCount: number; // Number of photos in this folder
}

// Updated GalleryItem interface to include folder support
export interface GalleryItemWithFolder {
  id: string;
  imageUri: string;
  caption: string;
  timestamp: number;
  folderId?: string; // Optional folder ID, null means "All Photos"
  cloudSynced?: boolean;
}

// Predefined folder colors
export const FOLDER_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

// Predefined folder icons
export const FOLDER_ICONS = [
  'folder',
  'camera',
  'heart',
  'star',
  'home',
  'car',
  'airplane',
  'restaurant',
  'fitness',
  'school',
  'briefcase',
  'musical-notes',
  'game-controller',
  'gift',
  'flower',
];

// Default folders that are created automatically
export const DEFAULT_FOLDERS: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'photoCount'>[] = [
  {
    name: 'Favorites',
    color: '#EC4899',
    icon: 'heart',
  },
  {
    name: 'Recent',
    color: '#3B82F6',
    icon: 'time',
  },
];

const FOLDERS_STORAGE_KEY = '@MyGallery:folders';

export const FolderStorageService = {
  // Save folders to local storage
  async saveFolders(folders: Folder[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(folders);
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving folders:', error);
      throw error;
    }
  },

  // Load folders from local storage
  async loadFolders(): Promise<Folder[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
      const folders = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // If no folders exist, create default folders
      if (folders.length === 0) {
        const defaultFolders = await this.createDefaultFolders();
        return defaultFolders;
      }
      
      return folders;
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
  },

  // Create default folders
  async createDefaultFolders(): Promise<Folder[]> {
    const now = Date.now();
    const defaultFolders: Folder[] = DEFAULT_FOLDERS.map((folder, index) => ({
      ...folder,
      id: `default_${index}_${now}`,
      createdAt: now,
      updatedAt: now,
      photoCount: 0,
    }));

    await this.saveFolders(defaultFolders);
    return defaultFolders;
  },

  // Create a new folder
  async createFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'photoCount'>): Promise<Folder> {
    try {
      const folders = await this.loadFolders();
      const now = Date.now();
      const newFolder: Folder = {
        ...folderData,
        id: `folder_${now}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        photoCount: 0,
      };

      const updatedFolders = [...folders, newFolder];
      await this.saveFolders(updatedFolders);
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  // Update an existing folder
  async updateFolder(folderId: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const folderIndex = folders.findIndex(f => f.id === folderId);
      
      if (folderIndex === -1) {
        throw new Error('Folder not found');
      }

      folders[folderIndex] = {
        ...folders[folderIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      await this.saveFolders(folders);
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  // Delete a folder
  async deleteFolder(folderId: string): Promise<void> {
    try {
      const folders = await this.loadFolders();
      const updatedFolders = folders.filter(f => f.id !== folderId);
      await this.saveFolders(updatedFolders);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  // Update photo count for a folder
  async updatePhotoCount(folderId: string, count: number): Promise<void> {
    try {
      await this.updateFolder(folderId, { photoCount: count });
    } catch (error) {
      console.error('Error updating photo count:', error);
      throw error;
    }
  },

  // Get folder by ID
  async getFolderById(folderId: string): Promise<Folder | null> {
    try {
      const folders = await this.loadFolders();
      return folders.find(f => f.id === folderId) || null;
    } catch (error) {
      console.error('Error getting folder by ID:', error);
      return null;
    }
  },
};