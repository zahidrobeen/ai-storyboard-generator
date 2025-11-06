
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StoryboardPanel } from './components/StoryboardPanel';
import { generateImage } from './services/geminiService';
import { Scene, StoryboardImage } from './types';
import { ControlsPanel } from './components/ControlsPanel';
import { ApiKeySelector } from './components/ApiKeySelector';
import { Loader } from './components/Loader';

// FIX: The global declaration for window.aistudio was moved to types.ts
// to resolve conflicting declaration errors.

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [storyboardImages, setStoryboardImages] = useState<Record<string, StoryboardImage>>({});
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);


  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
      } else {
        // Fallback for environments where aistudio is not available
        console.warn('aistudio context not found.');
        setHasApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleApiError = (e: any) => {
    const errorMessage = e.message || 'An unknown error occurred';
    if (errorMessage.includes("Requested entity was not found")) {
      setError("Your API key is invalid or has been revoked. Please select a new one.");
      setHasApiKey(false);
    } else {
       setError(errorMessage);
    }
    console.error("API Error:", e);
  };

  const handleScriptSubmit = (scriptText: string) => {
    if (!scriptText.trim()) return;

    setIsParsing(true);
    setError(null);
    setScenes([]);
    setStoryboardImages({});
    try {
      const sentences = scriptText.match(/[^.!?]+[.!?]+/g) || [];
      
      const newScenes: Scene[] = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const snippet = sentences.slice(i, i + 2).join(' ').trim();
        if (snippet) {
          const scene: Scene = {
            scene_number: `Shot ${Math.floor(i / 2) + 1}`,
            original_script_snippet: snippet,
            visual_description: snippet,
          };
          newScenes.push(scene);
        }
      }

      if (newScenes.length === 0 && scriptText.trim().length > 0) {
        const scene: Scene = {
            scene_number: `Shot 1`,
            original_script_snippet: scriptText.trim(),
            visual_description: scriptText.trim(),
          };
        newScenes.push(scene);
      }

      setScenes(newScenes);

    } catch (e: any) {
      setError('Failed to process the script into shots.');
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };
  
  const handleRegenerateImage = async (sceneToRegenerate: Scene) => {
    setError(null);
    setStoryboardImages(prev => ({
      ...prev,
      [sceneToRegenerate.scene_number]: { status: 'loading' },
    }));

    try {
      const imageUrl = await generateImage(sceneToRegenerate.visual_description);
      setStoryboardImages(prev => ({
        ...prev,
        [sceneToRegenerate.scene_number]: { status: 'done', url: imageUrl },
      }));
    } catch (e: any) {
      handleApiError(e);
      setStoryboardImages(prev => ({
        ...prev,
        [sceneToRegenerate.scene_number]: { status: 'error', error: e.message || 'Generation failed' },
      }));
    }
  };

  useEffect(() => {
    if (scenes.length > 0 && hasApiKey) {
      const generateAllImages = async () => {
        setIsGenerating(true);
        setError(null);
        setStoryboardImages(
          scenes.reduce((acc, scene) => {
            acc[scene.scene_number] = { status: 'loading' };
            return acc;
          }, {} as Record<string, StoryboardImage>)
        );

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (const [index, scene] of scenes.entries()) {
          try {
            const imageUrl = await generateImage(scene.visual_description);
            setStoryboardImages(prev => ({
              ...prev,
              [scene.scene_number]: { status: 'done', url: imageUrl },
            }));
          } catch (e: any) {
            handleApiError(e);
            setStoryboardImages(prev => ({
              ...prev,
              [scene.scene_number]: { status: 'error', error: e.message || 'Generation failed' },
            }));
            // Stop generation if API key fails
            if (e.message?.includes("Requested entity was not found")) {
              break;
            }
          }
          
          if (index < scenes.length - 1) {
            await sleep(15000); 
          }
        }
        setIsGenerating(false);
      };
      generateAllImages();
    }
  }, [scenes, hasApiKey]);

  if (hasApiKey === null) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Loader size="lg" text="Initializing..."/>
        </div>
    )
  }

  if (!hasApiKey) {
    return <ApiKeySelector onKeySelected={() => { setHasApiKey(true); setError(null); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-200">
      <Header />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-px">
        <aside className="lg:col-span-3 xl:col-span-3 bg-[#1C1C1E] p-4 sm:p-6 h-full">
            <ControlsPanel 
                onScriptSubmit={handleScriptSubmit} 
                disabled={isParsing || isGenerating} 
            />
            {error && <p className="text-red-400 mt-4 text-sm font-semibold">{error}</p>}
        </aside>
        <div className="lg:col-span-9 xl:col-span-9 bg-black p-4 sm:p-6 overflow-y-auto h-[calc(100vh-65px)]">
            <StoryboardPanel 
              scenes={scenes} 
              images={storyboardImages} 
              isParsing={isParsing}
              onRegenerate={handleRegenerateImage}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
