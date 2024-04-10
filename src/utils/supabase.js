import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
const supabaseKey = process.env.VUE_APP_SUPABASE_PUBLIC_KEY;

export const supabase  = createClient(supabaseUrl, supabaseKey);