// store.js
import { writable } from 'svelte/store';

export const isSimulationRunning = writable(true);
export const isEditorMode = writable(false);