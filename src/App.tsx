/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Moon, Sun, BookOpen, BarChart2 } from 'lucide-react';
import { PromptSelector } from './components/PromptSelector';
import { BreathingTransition } from './components/BreathingTransition';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [emotion, setEmotion] = useState('');
  const [reflection, setReflection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'journey'>('journal');
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchEntries(currentUser.uid);
    });
  }, []);

  const fetchEntries = async (uid: string) => {
    const q = query(collection(db, `users/${uid}/journals`), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/journals`, id));
      fetchEntries(user.uid);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const emotions = ['Calm', 'Anxious', 'Happy', 'Overwhelmed', 'Reflective'];

  const emotionThemes = {
    Calm: 'blue',
    Anxious: 'amber',
    Happy: 'rose',
    Overwhelmed: 'indigo',
    Reflective: 'violet',
  } as const;

  const currentTheme = emotion ? emotionThemes[emotion as keyof typeof emotionThemes] : 'orange';

  const handleReflect = () => {
    if (!journalEntry || !user || !emotion) return;
    setShowBreathing(true);
  };

  const proceedWithReflection = async () => {
    setShowBreathing(false);
    setIsLoading(true);
    
    let reflectionText = '';
    
    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntry: `Emotion: ${emotion}\nEntry: ${journalEntry}` }),
      });
      
      if (!response.ok) throw new Error("API call failed");
      
      const data = await response.json();
      reflectionText = data.reflection;
    } catch (error) {
      console.error('Error:', error);
      reflectionText = "I hear you, and it sounds like this is weighing on you. Remember that it's okay to feel this way. How does focusing on the present moment, even just for a few breaths, feel to you right now? Take care of yourself.";
    }

    setReflection(reflectionText);

    try {
      await addDoc(collection(db, `users/${user!.uid}/journals`), {
        userId: user!.uid,
        entry: journalEntry,
        emotion: emotion,
        reflection: reflectionText,
        createdAt: serverTimestamp(),
      });
      fetchEntries(user!.uid);
    } catch (error) {
      console.error('Error saving to DB:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-orange-50 text-zinc-800'}`}>
      <header className={`max-w-2xl mx-auto mb-12 border-b p-6 flex justify-between items-center transition-colors duration-500 ${isDarkMode ? 'border-zinc-700' : 'border-orange-100'}`}>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('journal')} className={`flex items-center gap-2 ${activeTab === 'journal' ? 'opacity-100' : 'opacity-50'}`}><BookOpen size={18}/> Journal</button>
          <button onClick={() => setActiveTab('journey')} className={`flex items-center gap-2 ${activeTab === 'journey' ? 'opacity-100' : 'opacity-50'}`}><BarChart2 size={18}/> My Journey</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-orange-100'}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-full" />
          ) : (
            <button onClick={handleSignIn} className="text-xs uppercase tracking-wider">Sign In</button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-8 px-6 pb-12">
        {!user ? (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-3xl shadow-sm border text-center transition-colors duration-500 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-orange-100'}`}>
            <p className="mb-6">Please sign in to start your journaling journey.</p>
            <button onClick={handleSignIn} className="px-8 py-3 bg-zinc-950 text-white text-xs uppercase tracking-[0.2em] rounded-full hover:opacity-90 transition">Sign In with Google</button>
          </motion.section>
        ) : activeTab === 'journal' ? (
          <AnimatePresence>
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-3xl shadow-sm border transition-colors duration-500 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-orange-100'}`}>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-4 opacity-70">How are you feeling?</label>
              <div className="flex flex-wrap gap-3 mb-6">
                {emotions.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmotion(e)}
                    className={`px-4 py-1.5 rounded-full border transition text-[11px] uppercase tracking-wider ${emotion === e ? 'bg-zinc-950 text-white border-zinc-950' : isDarkMode ? 'bg-zinc-700 text-zinc-300 border-zinc-600' : 'bg-orange-100 text-zinc-600 border-orange-200'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <PromptSelector onSelect={setJournalEntry} />
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className={`w-full h-40 p-4 rounded-2xl border focus:ring-1 transition text-sm font-light ${isDarkMode ? 'bg-zinc-900 border-zinc-700 focus:ring-zinc-500' : 'bg-orange-50/50 border-orange-100 focus:ring-zinc-900'}`}
                placeholder="What is resting on your mind?"
              />
              
              <button
                onClick={handleReflect}
                disabled={isLoading || !journalEntry || !emotion}
                className="mt-6 w-full py-3 bg-zinc-950 text-white text-xs uppercase tracking-[0.2em] rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Reflecting...' : 'Reflect with Mana'}
              </button>
            </motion.section>

            {reflection && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-3xl shadow-sm border transition-colors duration-500 ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-orange-100'}`}
              >
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 opacity-70">Gentle Reflection</h2>
                <p className="leading-relaxed font-serif italic text-lg opacity-90">{reflection}</p>
                <p className="mt-6 text-[10px] text-zinc-500 border-t pt-4">Mana is an AI self-reflection companion based on Cognitive Psychology, not a substitute for clinical therapy or medical advice.</p>
              </motion.section>
            )}
          </AnimatePresence>
        ) : (
          <Dashboard entries={entries} onDeleteEntry={handleDeleteEntry} />
        )}
      </main>
      
      {showBreathing && <BreathingTransition onComplete={proceedWithReflection} />}
    </div>
  );
}
