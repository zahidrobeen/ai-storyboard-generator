
// FIX: Added a global declaration for window.aistudio to provide a single
// source of truth for its type, resolving compilation errors.
// The interface is named `AIStudio` to match compiler expectations from the error message.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

export interface Scene {
  scene_number: string;
  visual_description: string;
  original_script_snippet: string;
}

export interface StoryboardImage {
  status: 'idle' | 'loading' | 'done' | 'error';
  url?: string;
  error?: string;
}
