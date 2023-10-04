import type { Struxt } from '$lib/server/db/schema'
import { writable } from 'svelte/store'

export const activeStruxt = writable<Struxt | null>(null)
