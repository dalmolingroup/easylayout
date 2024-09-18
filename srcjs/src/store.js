// store.js
import { writable } from 'svelte/store';

export const isSimulationRunning = writable(false);
export const isEditorMode = writable(false);