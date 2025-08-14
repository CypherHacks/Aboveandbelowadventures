// src/services/packages.ts
import { supabase } from '../lib/supabaseClient';
import type { Package } from '../types/package';

export async function getPackages(): Promise<Package[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('*');

  if (error) throw error;
  return (data ?? []) as Package[];
}
