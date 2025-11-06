import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StoryboardPanel } from './components/StoryboardPanel';
import { generateImage, editImage, getCurrentTier, tierChangeNotifier } from './services/geminiService';
import { Scene, StoryboardImage } from './types';
import { ControlsPanel } from './components/ControlsPanel';

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [storyboardImages, setStoryboardImages] = useState<Record<string, StoryboardImage>>({});
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiTier, setApiTier] = useState<'free' | 'paid'>(getCurrentTier());

  useEffect(() => {
    const handleTierChange = () => {
        setApiTier(getCurrentTier());
    };
    tierChangeNotifier.addEventListener('tierChange', handleTierChange);
    return () => {
        tierChangeNotifier.removeEventListener('tierChange', handleTierChange);
    };
  }, []);

  const handleApiError = (e: any) => {
    const errorMessage = e.message || 'An unknown error occurred';
    setError(errorMessage);
    console.error("API Error:", e);
  };

  const handleScriptSubmit = (scriptText: string) => {
    if (!scriptText.trim()) return;

    setIsParsing(true);
    setError(null);
    setScenes([]);
    setStoryboardImages({});
    try {
      const paragraphs = scriptText.split(/\n\s*\n/).filter(p => p.trim() !== '');

      const newScenes: Scene[] = [];
      const paragraphsPerScene = apiTier === 'free' ? 1 : 2;

      for (let i = 0; i < paragraphs.length; i += paragraphsPerScene) {
        const chunk = paragraphs.slice(i, i + paragraphsPerScene);
        const combinedSnippet = chunk.map(p => p.trim()).join('\n\n');
        
        if (combinedSnippet) {
          newScenes.push({
            scene_number: `Shot ${newScenes.length + 1}`,
            original_script_snippet: combinedSnippet,
            visual_description: combinedSnippet,
            edit_instruction: '',
          });
        }
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
    const sceneNumber = sceneToRegenerate.scene_number;
    const existingImage = storyboardImages[sceneNumber];

    setStoryboardImages(prev => ({
      ...prev,
      [sceneNumber]: { status: 'loading' },
    }));

    try {
      let imageUrl: string;
      if (existingImage?.status === 'done' && existingImage.url && sceneToRegenerate.edit_instruction.trim()) {
        imageUrl = await editImage(existingImage.url, sceneToRegenerate.edit_instruction);
      } else {
        imageUrl = await generateImage(sceneToRegenerate.visual_description);
      }

      setStoryboardImages(prev => ({
        ...prev,
        [sceneNumber]: { status: 'done', url: imageUrl },
      }));
    } catch (e: any) {
      handleApiError(e);
      setStoryboardImages(prev => ({
        ...prev,
        [sceneNumber]: { status: 'error', error: e.message || 'Generation failed' },
      }));
    }
  };

  const handleFullRegenerateImage = async (sceneToRegenerate: Scene) => {
    setError(null);
    const sceneNumber = sceneToRegenerate.scene_number;

    setStoryboardImages(prev => ({
      ...prev,
      [sceneNumber]: { status: 'loading' },
    }));

    try {
      const imageUrl = await generateImage(sceneToRegenerate.visual_description);

      setStoryboardImages(prev => ({
        ...prev,
        [sceneNumber]: { status: 'done', url: imageUrl },
      }));
    } catch (e: any) {
      handleApiError(e);
      setStoryboardImages(prev => ({
        ...prev,
        [sceneNumber]: { status: 'error', error: e.message || 'Generation failed' },
      }));
    }
  };

  const handlePromptChange = (sceneNumber: string, newPrompt: string) => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.scene_number === sceneNumber
          ? { ...scene, edit_instruction: newPrompt }
          : scene
      )
    );
  };

  useEffect(() => {
    if (scenes.length > 0 && !isGenerating) {
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
            break; 
          }
          
          if (index < scenes.length - 1) {
            await sleep(1000); 
          }
        }
        setIsGenerating(false);
      };

      const hasInitialImages = Object.keys(storyboardImages).length > 0;
        if (!hasInitialImages) {
            generateAllImages();
        }
    }
  }, [scenes]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-200">
      <Header />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-px">
        <aside className="lg:col-span-3 xl:col-span-3 bg-[#1C1C1E] p-4 sm:p-6 h-full">
            <ControlsPanel 
                onScriptSubmit={handleScriptSubmit} 
                disabled={isParsing || isGenerating} 
                apiTier={apiTier}
            />
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 mt-4 p-3 rounded-lg">
                <p className="text-sm font-bold">An error occurred</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            )}
        </aside>
        <div className="lg:col-span-9 xl:col-span-9 bg-black p-4 sm:p-6 overflow-y-auto h-[calc(100vh-65px)]">
            <StoryboardPanel 
              scenes={scenes} 
              images={storyboardImages} 
              isParsing={isParsing}
              onRegenerate={handleRegenerateImage}
              onFullRegenerate={handleFullRegenerateImage}
              onPromptChange={handlePromptChange}
            />
        </div>
      </main>
    </div>
  );
};

export default App;