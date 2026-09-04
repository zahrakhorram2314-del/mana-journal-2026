import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Trash2 } from 'lucide-react';

interface Entry {
  emotion: string;
  entry: string;
}

export const Dashboard = ({ entries, onDeleteEntry }: { entries: any[], onDeleteEntry: (id: string) => void }) => {
  const [search, setSearch] = useState('');
  
  const filtered = entries.filter(e => e.entry?.toLowerCase().includes(search.toLowerCase()));

  // Mood data
  const moodCounts = entries.reduce((acc, curr) => {
    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const moodData = Object.entries(moodCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#fbbf24', '#60a5fa', '#f87171', '#818cf8', '#a78bfa'];

  return (
    <div className="space-y-8">
      <input 
        type="text" 
        placeholder="Search entries..." 
        value={search} 
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 rounded-xl border border-orange-100 bg-white"
      />
      
      <div className="h-64 bg-white p-6 rounded-3xl border border-orange-100">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
              {moodData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase">Past Entries</h3>
        {filtered.map(entry => (
          <div key={entry.id} className="p-6 bg-white rounded-3xl border border-orange-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-orange-400">
                {new Date(entry.createdAt?.seconds * 1000).toLocaleDateString()}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-orange-100 text-zinc-600">
                {entry.emotion}
              </span>
            </div>
            <p className="text-sm mb-4 italic text-zinc-600">"{entry.entry}"</p>
            <p className="text-sm text-zinc-800 border-t pt-4">{entry.reflection}</p>
            <button 
                onClick={() => onDeleteEntry(entry.id)}
                className="mt-4 p-2 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Delete entry"
            >
                <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button 
          onClick={() => {
            const data = JSON.stringify(entries, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-reflections.json';
            a.click();
          }}
          className="mt-6 px-4 py-2 bg-zinc-950 text-white text-xs rounded-full"
        >
          Export Reflections (JSON)
        </button>
      </div>
    </div>
  );
};
