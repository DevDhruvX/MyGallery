import { GalleryItem, supabase } from '../supabaseConfig';

export class SupabaseGalleryService {
  // Get all gallery items for the current user
  static async getGalleryItems(): Promise<GalleryItem[]> {
    try {
      // RLS automatically filters by authenticated user
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      return [];
    }
  }

  // Add a new gallery item
  static async addGalleryItem(
    imageUrl: string,
    caption?: string
  ): Promise<GalleryItem | null> {
    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Explicitly set user_id for RLS
      const newItem = {
        user_id: user.id,
        image_url: imageUrl,
        caption: caption || null,
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

  // Update a gallery item's caption
  static async updateGalleryItem(
    itemId: number, // Changed to number for new SERIAL id
    caption: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({
          caption,
        })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating gallery item:', error);
      return false;
    }
  }

  // Delete a gallery item
  static async deleteGalleryItem(itemId: number): Promise<boolean> { // Changed to number
    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      return false;
    }
  }

  // Upload image to Supabase Storage
  static async uploadImage(
    imageUri: string,
    fileName: string
  ): Promise<string | null> {
    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Read the file as array buffer for React Native
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      // Convert to Uint8Array
      const fileData = new Uint8Array(arrayBuffer);

      // Upload using the file data
      const filePath = `${user.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
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

export default SupabaseGalleryService;