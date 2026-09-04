import React from 'react';

const prompts = [
  'What made you feel good today?',
  'What would you change about today?',
  'What is one thing you learned today?',
  'What am I grateful for right now?'
];

export const PromptSelector = ({ onSelect }: { onSelect: (prompt: string) => void }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {prompts.map(p => (
      <button
        key={p}
        onClick={() => onSelect(p)}
        className="px-3 py-1 text-xs rounded-full bg-orange-100 hover:bg-orange-200 text-zinc-600 transition"
      >
        {p}
      </button>
    ))}
  </div>
);
