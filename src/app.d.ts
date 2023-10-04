// See https://kit.svelte.dev/docs/types#app

import type { Session, SupabaseClient } from '@supabase/supabase-js'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient<any, 'public', any>
      getSession: () => Promise<Session | null>
    }
    interface PageData {
      flash?: { type: 'success' | 'error'; message: string }
    }
    // interface Platform {}
  }
}

export {}
