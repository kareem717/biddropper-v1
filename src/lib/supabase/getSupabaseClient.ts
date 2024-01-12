import { env } from "@/env.mjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

let storageClient: SupabaseClient | null = null;

const getStorageClient: () => SupabaseClient = () => {
  if (storageClient) return storageClient;
  storageClient = createClient(
    env.SUPABASE_ENDPOINT,
    env.SUPABASE_PUBLIC_ANON_KEY,
  );
  return storageClient;
};

export default getStorageClient;
