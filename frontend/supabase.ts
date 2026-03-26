
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file: File): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('lada_images')
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading image', error);
            return null;
        }
        const { data: { publicUrl } } = supabase.storage
            .from('lada_images')
            .getPublicUrl(fileName);
        return publicUrl;
    } catch (err) {
        console.error(err);
        return null;
    }
};
