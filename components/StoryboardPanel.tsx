import React, { useState } from 'react';
import { Scene, StoryboardImage } from '../types';
import { Loader } from './Loader';
import { DownloadIcon } from './icons/DownloadIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface StoryboardPanelProps {
  scenes: Scene[];
  images: Record<string, StoryboardImage>;
  isParsing: boolean;
  onRegenerate: (scene: Scene) => void;
  onFullRegenerate: (scene: Scene) => void;
  onPromptChange: (sceneNumber: string, newPrompt: string) => void;
}

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ scenes, images, isParsing, onRegenerate, onFullRegenerate, onPromptChange }) => {
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());

  const toggleExpand = (sceneNumber: string) => {
    setExpandedScenes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sceneNumber)) {
        newSet.delete(sceneNumber);
      } else {
        newSet.add(sceneNumber);
      }
      return newSet;
    });
  };
  
  const handleDownload = (imageUrl: string, sceneNumber: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `storyboard_shot_${sceneNumber.replace(' ', '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isParsing) {
      return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <Loader size="lg" text="Processing script..."/>
        </div>
      );
  }

  if (scenes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-900/50 rounded-lg border-2 border-dashed border-zinc-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-300">Storyboard Output</h2>
        <p className="mt-2 text-zinc-500">Your generated images will appear here.</p>
      </div>
    );
  }

  const renderMedia = (scene: Scene) => {
    const image = images[scene.scene_number];

    if (image?.status === 'done' && image.url) {
      return (
        <div className="relative group w-full h-full">
            <img src={image.url} alt={scene.visual_description} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => onFullRegenerate(scene)} className="p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm transition-colors" title="Regenerate from scratch">
                    <ArrowPathIcon className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => handleDownload(image.url!, scene.scene_number)} className="p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm transition-colors" title="Download image">
                    <DownloadIcon className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
      );
    }
    
    if (image?.status === 'loading') {
      return <Loader text="Generating..." />;
    }

    if (image?.status === 'error') {
       return (
        <div className="text-center text-red-400 p-4 flex flex-col items-center justify-center h-full bg-red-900/20">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-semibold mt-1">Image Failed</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-full truncate">{image.error}</p>
        </div>
      );
    }
    
    return null;
  };


  return (
    <div className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {scenes.map((scene) => {
          const isExpanded = expandedScenes.has(scene.scene_number);
          const needsTruncation = scene.original_script_snippet.length > 80;
          const image = images[scene.scene_number];
          const isLoading = image?.status === 'loading';

          return (
            <div key={scene.scene_number} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex flex-col">
              <div className="aspect-video bg-black flex items-center justify-center flex-shrink-0">
                {renderMedia(scene)}
              </div>
              <div className="p-3 flex-grow flex flex-col gap-3">
                <div>
                    <h3 className="font-semibold text-sm text-zinc-300">{scene.scene_number}</h3>
                    <p className={`text-zinc-400 text-xs mt-1 ${!isExpanded && needsTruncation ? 'line-clamp-2' : ''}`}>
                    {scene.original_script_snippet}
                    </p>
                    {needsTruncation && (
                    <button 
                        onClick={() => toggleExpand(scene.scene_number)} 
                        className="text-zinc-400 text-xs mt-2 hover:text-white focus:outline-none self-start"
                    >
                        {isExpanded ? 'See less' : 'See more'}
                    </button>
                    )}
                </div>
                <div className="mt-auto flex flex-col gap-2">
                    <label htmlFor={`prompt-${scene.scene_number}`} className="text-xs font-semibold text-zinc-400">Edit Instruction</label>
                    <textarea
                        id={`prompt-${scene.scene_number}`}
                        value={scene.edit_instruction}
                        onChange={(e) => onPromptChange(scene.scene_number, e.target.value)}
                        placeholder="Write your prompt to make any changes!"
                        rows={3}
                        disabled={isLoading}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#D4FE72] transition-colors disabled:bg-zinc-800/50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={() => onRegenerate(scene)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold py-2 px-3 rounded-md transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {image?.status === 'error' ? 'Retry' : 'Regenerate'}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};