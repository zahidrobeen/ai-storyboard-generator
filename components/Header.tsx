import React from 'react';

const Logo: React.FC = () => (
    <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 0L120 60L60 120L0 60L60 0Z" fill="url(#paint0_linear_1_2)"/>
        <path d="M60 20L100 60L60 100L20 60L60 20Z" fill="url(#paint1_linear_1_2)"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D4FE72"/>
                <stop offset="1" stopColor="#ACFD00"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="60" y1="20" x2="60" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1C1C1E"/>
                <stop offset="1" stopColor="#000000"/>
            </linearGradient>
        </defs>
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-black/80 backdrop-blur-sm border-b border-zinc-800 p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <Logo />
                <h1 className="text-xl font-bold text-white tracking-tighter">Caparison AI</h1>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">Pricing</button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors">
                Personal
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-lime-500"></div>
            </button>
        </div>
      </div>
    </header>
  );
};
