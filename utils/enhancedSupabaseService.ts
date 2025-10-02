import { supabase } from '../supabaseConfig';

// Enhanced interface with backup support
export interface BackupGalleryItem {
  id: number;
  user_id: string;
  image_url: string;
  caption?: string;
  is_deleted_locally: boolean;
  deleted_locally_at?: string;
  is_permanently_deleted: boolean;
  permanently_deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export class EnhancedSupabaseService {
  // Get active gallery items (not deleted locally)
  static async getActiveItems(): Promise<BackupGalleryItem[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_deleted_locally', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active items:', error);
      return [];
    }
  }

  // Get recycle bin items (deleted locally but not permanently)
  static async getRecycleBinItems(): Promise<BackupGalleryItem[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_deleted_locally', true)
        .eq('is_permanently_deleted', false)
        .order('deleted_locally_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recycle bin items:', error);
      return [];
    }
  }

  // Get all items for backup restore (including permanently deleted)
  static async getAllBackupItems(): Promise<BackupGalleryItem[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching backup items:', error);
      return [];
    }
  }

  // Add new item (always active)
  static async addGalleryItem(
    imageUrl: string,
    caption?: string
  ): Promise<BackupGalleryItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const newItem = {
        user_id: user.id,
        image_url: imageUrl,
        caption: caption || null,
        is_deleted_locally: false,
        is_permanently_deleted: false,
      };

      const { data, error } = await supabase
        .from('gallery_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding gallery item:', error);
      return null;
    }
  }

  // Soft delete (move to recycle bin)
  static async moveToRecycleBin(itemId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          is_deleted_locally: true,
          deleted_locally_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error moving to recycle bin:', error);
      return false;
    }
  }

  // Restore from recycle bin
  static async restoreFromRecycleBin(itemId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          is_deleted_locally: false,
          deleted_locally_at: null,
        })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error restoring from recycle bin:', error);
      return false;
    }
  }

  // Permanent delete (empty recycle bin)
  static async permanentDelete(itemId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          is_permanently_deleted: true,
          permanently_deleted_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      return false;
    }
  }

  // Restore from backup (even permanently deleted items)
  static async restoreFromBackup(itemId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          is_deleted_locally: false,
          deleted_locally_at: null,
          is_permanently_deleted: false,
          permanently_deleted_at: null,
        })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  // Update caption
  static async updateCaption(itemId: number, caption: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ caption })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating caption:', error);
      return false;
    }
  }

  // Upload image (same as before)
  static async uploadImage(
    imageUri: string,
    fileName: string
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const filePath = `${user.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }
}

export default EnhancedSupabaseService;