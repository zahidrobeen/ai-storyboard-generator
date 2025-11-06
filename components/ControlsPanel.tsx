import React, { useState } from 'react';

interface ControlsPanelProps {
  onScriptSubmit: (content: string) => void;
  disabled: boolean;
}

const ChevronDown: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
)

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ onScriptSubmit, disabled }) => {
  const [scriptText, setScriptText] = useState<string>('');

  const handleSubmit = () => {
    if (scriptText.trim()) {
      onScriptSubmit(scriptText.trim());
    }
  };

  const OptionCard: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md p-2.5 flex items-center justify-between cursor-pointer hover:border-zinc-600">
        <div>
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
        <ChevronDown className="w-5 h-5 text-zinc-500" />
    </div>
  )

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <label htmlFor="video-script" className="text-sm font-semibold text-zinc-200 block mb-2">Video Script</label>
            <textarea
                id="video-script"
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="A person is standing in front and a lot of books are falling from the sky"
                disabled={disabled}
                rows={8}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4FE72] transition-colors disabled:bg-zinc-800/50 disabled:cursor-not-allowed"
            />
        </div>

        <div className="flex items-center gap-3">
             <OptionCard label="Resolution" value="1080p"/>
             <OptionCard label="Aspect Ratio" value="16:9"/>
        </div>


      <div className="mt-auto">
        <button
            onClick={handleSubmit}
            disabled={disabled || !scriptText.trim()}
            className="w-full bg-[#D4FE72] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1C1C1E] focus:ring-[#D4FE72] transition-all duration-200 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {disabled ? 'Generating...' : 'Generate'}
            {!disabled && <span className="text-xs font-bold bg-black/10 px-2 py-1 rounded-md">✨ 50</span>}
        </button>
      </div>
    </div>
  );
};