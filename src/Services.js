
import { supabase } from "./SupabaseClient";


export const createSignedUrl = async (url) => {
  const fileName = url.split("photos/")[1];
  const { data, error } = await supabase.storage
    .from("passport-photos")
    .createSignedUrl(fileName, 60 * 60);

  if (error) {
    console.error(error);
    return null;
  }
  return data.signedUrl;
};

 
