import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn(
    "Supabase admin client missing configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable persistence.",
  );
}

export const supabaseAdmin = supabaseUrl && serviceKey
  ? createClient<Database>(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;