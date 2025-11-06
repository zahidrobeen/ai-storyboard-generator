import React from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    // The window.aistudio.openSelectKey() function opens a dialog for the user to
    // select an API key. This is a specific requirement for this environment.
    await window.aistudio.openSelectKey();
    
    // Per documentation, assume selection is successful and update the UI state
    // to avoid race conditions with `hasSelectedApiKey`.
    onKeySelected();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center max-w-lg mx-auto p-8 bg-[#1C1C1E] rounded-xl border border-zinc-800">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-zinc-800 border-2 border-zinc-700">
            <KeyIcon className="h-8 w-8 text-[#D4FE72]" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Select your Google AI API Key
        </h2>
        <p className="mt-4 text-zinc-400">
          To use this application, you need to select a Google AI API key. Your key is used to access the Gemini models and is stored securely.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
            Learn more about billing at{' '}
            <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-300"
            >
                ai.google.dev/gemini-api/docs/billing
            </a>.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSelectKey}
            className="w-full bg-[#D4FE72] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1C1C1E] focus:ring-[#D4FE72] transition-all duration-200"
          >
            Select API Key
          </button>
        </div>
      </div>
    </div>
  );
};