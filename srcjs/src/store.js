// store.js
import { writable } from 'svelte/store';

export const nodePositions = writable(new Map());
export const isSimulationRunning = writable(true);
export const isEditorMode = writable(false);