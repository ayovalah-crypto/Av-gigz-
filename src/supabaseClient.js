import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zscukrvctpdswgfmphto.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzY3VrcnZjdHBkc3dnZm1waHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjAxODIsImV4cCI6MjEwMzU5NjE4Mn0.c9kdeUgUEmVhu5PR-G727jV999CvJ7fGVkNmot39FGU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
