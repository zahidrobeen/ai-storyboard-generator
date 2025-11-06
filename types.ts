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
