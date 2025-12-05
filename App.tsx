import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { ResultsView } from './components/ResultsView';
import { SavedItems } from './components/SavedItems';
import { analyzeImage, analyzeText, fileToBase64 } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { ScanLine, AlertCircle, Gamepad2, Settings, X, Trash2, FileText, ShieldCheck, Sun, Moon, Info } from './components/IconComponents';

const STORAGE_KEY = 'snapscout_uk_loot_v2';
const XP_KEY = 'snapscout_user_xp';

type Theme = 'dark' | 'light';

const LOADING_STEPS = [
  "System Boot...",
  "Initializing Neural Link...",
  "Decrypting Visual Data...",
  "Scanning Item Geometry...",
  "Extracting Feature Points...",
  "Accessing UK Retail Database...",
  "Comparing Market Prices...",
  "Synthesizing Intel Report...",
  "Mission Ready."
];

function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [savedItems, setSavedItems] = useState<AnalysisResult[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showSettings, setShowSettings] = useState(false);
  
  // Game State
  const [xp, setXp] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
    // Load saved items
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }
    // Load XP
    const savedXp = localStorage.getItem(XP_KEY);
    if (savedXp) {
        setXp(parseInt(savedXp, 10));
    }
    // Apply default theme
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Loading Step Cycle
  useEffect(() => {
    if (loadingState === LoadingState.ANALYZING) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < LOADING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 600); // Faster cycle
      return () => clearInterval(interval);
    }
  }, [loadingState]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addXp = (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem(XP_KEY, newXp.toString());
  };

  const saveItem = (item: AnalysisResult) => {
    if (savedItems.some(i => i.id === item.id)) return;
    
    const newItems = [item, ...savedItems];
    setSavedItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    
    // XP Reward for saving
    addXp(20);
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = savedItems.filter(i => i.id !== id);
    setSavedItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const clearHistory = () => {
    setSavedItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const selectSavedItem = (item: AnalysisResult) => {
     setAnalysisResult(item);
     setLoadingState(LoadingState.SUCCESS);
     setImagePreview(null); 
     window.scrollTo(0,0);
  };

  const handleImageSelect = async (file: File, isBarcode: boolean) => {
    try {
      setLoadingState(LoadingState.ANALYZING);
      setErrorMsg(null);
      
      const base64 = await fileToBase64(file);
      setImagePreview(`data:${file.type};base64,${base64}`);
      
      const result = await analyzeImage(base64, file.type, isBarcode);
      setAnalysisResult(result);
      setLoadingState(LoadingState.SUCCESS);
      
      // XP Reward for Scan
      addXp(50);
    } catch (err: any) {
      console.error(err);
      setLoadingState(LoadingState.ERROR);
      setErrorMsg(err.message || "Failed to identify item. Try again.");
    }
  };

  const handleTextSearch = async (query: string) => {
    try {
      setLoadingState(LoadingState.ANALYZING);
      setErrorMsg(null);
      setImagePreview(null); 

      const result = await analyzeText(query);
      setAnalysisResult(result);
      setLoadingState(LoadingState.SUCCESS);
      
      // XP Reward for Search
      addXp(30);
    } catch (err: any) {
      console.error(err);
      setLoadingState(LoadingState.ERROR);
      setErrorMsg(err.message || "Failed to analyze data. Try again.");
    }
  };

  const handleReset = () => {
    setLoadingState(LoadingState.IDLE);
    setAnalysisResult(null);
    setImagePreview(null);
    setErrorMsg(null);
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
        <div className="bg-game-card p-8 rounded-2xl shadow-xl max-w-md text-center border border-game-primary/30">
          <AlertCircle size={48} className="mx-auto text-game-primary mb-4" />
          <h1 className="text-2xl font-bold text-game-text mb-2">System Error</h1>
          <p className="text-game-muted font-mono text-sm">
            Critical Failure: API_KEY missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg font-sans text-game-text selection:bg-game-primary selection:text-white transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-game-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-game-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-game-bg/80 backdrop-blur-md border-b border-white/5 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-16 relative flex items-center justify-center">
          
          {/* Left: Home/Reset */}
          <div className="absolute left-4 flex items-center h-full">
            <button onClick={handleReset} className="text-game-primary hover:text-game-accent transition-colors p-2">
              <ScanLine size={24} />
            </button>
          </div>
          
          {/* Center: Logo */}
          <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={handleReset}>
            <span className="font-black text-xl tracking-tighter text-game-text leading-none group-hover:scale-105 transition-transform">
              SNAP<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-accent">SCOUT</span>
            </span>
            <p className="text-[9px] text-game-muted font-bold tracking-[0.2em] uppercase leading-none mt-1 opacity-70">
              UK Price Tracker
            </p>
          </div>
          
          {/* Right: Settings/Status */}
          <div className="absolute right-4 flex items-center gap-3 h-full">
             <div className="hidden sm:flex items-center gap-2 bg-game-card border border-white/10 px-3 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-game-success animate-pulse"></span>
                <span className="text-xs font-bold text-game-muted">ONLINE</span>
             </div>
             <button 
               onClick={() => setShowSettings(true)}
               className="bg-game-card text-game-muted border border-white/10 p-2 rounded-lg hover:bg-game-surface hover:text-game-text transition-colors"
             >
                <Settings size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
          <div className="bg-game-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-game-surface/50">
               <h2 className="text-lg font-black text-game-text flex items-center gap-2">
                 <Settings size={20} className="text-game-primary"/> Settings
               </h2>
               <button onClick={() => setShowSettings(false)} className="text-game-muted hover:text-game-text">
                 <X size={24} />
               </button>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-game-bg rounded-lg text-game-secondary">
                     {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                   </div>
                   <div>
                     <p className="font-bold text-sm text-game-text">Appearance</p>
                     <p className="text-xs text-game-muted">{theme === 'dark' ? 'Night Mode' : 'Day Mode'}</p>
                   </div>
                 </div>
                 <button 
                   onClick={toggleTheme} 
                   className="bg-game-bg border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-game-text hover:border-game-accent transition-colors"
                 >
                   SWITCH
                 </button>
              </div>

              {/* Clear History */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-game-bg rounded-lg text-red-400">
                     <Trash2 size={20} />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-game-text">Clear Scan History</p>
                     <p className="text-xs text-game-muted">Removes all your saved items</p>
                   </div>
                 </div>
                 <button 
                   onClick={clearHistory}
                   className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                 >
                   Clear All
                 </button>
              </div>

              {/* Legal / Info */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-start gap-3">
                   <ShieldCheck size={16} className="text-game-success shrink-0 mt-0.5" />
                   <div>
                      <p className="text-xs font-bold text-game-text mb-1">Privacy Info</p>
                      <p className="text-[10px] text-game-muted leading-relaxed">
                        We do not store your images or personal data. All analysis is done securely via Google AI. Your history stays on this device.
                      </p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <FileText size={16} className="text-game-accent shrink-0 mt-0.5" />
                   <div>
                      <p className="text-xs font-bold text-game-text mb-1">How it works</p>
                      <p className="text-[10px] text-game-muted leading-relaxed">
                        Prices and product info are estimated by AI for guidance only. We check major UK retailers to find you the best deals.
                      </p>
                   </div>
                </div>
              </div>

            </div>
            <div className="p-4 bg-game-bg text-center">
              <p className="text-[10px] text-game-muted font-mono">SnapScout v2.2.0 // UK Region</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 pt-24 pb-12 min-h-[100vh]">
        
        {loadingState === LoadingState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Scanner 
              onImageSelect={handleImageSelect} 
              onTextSearch={handleTextSearch}
              isLoading={false}
            />
            <SavedItems 
              items={savedItems} 
              onSelect={selectSavedItem}
              onDelete={deleteItem}
            />
          </div>
        )}

        {loadingState === LoadingState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pop-in relative">
            {/* Gamified Loading UI */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
               {/* Outer Rings */}
               <div className="absolute inset-0 rounded-full border-2 border-game-primary/20 animate-[spin_3s_linear_infinite]"></div>
               <div className="absolute inset-4 rounded-full border-2 border-t-game-accent border-b-transparent border-l-transparent border-r-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
               <div className="absolute inset-0 rounded-full border border-white/5"></div>
               
               {/* Core */}
               <div className="relative z-10 bg-game-surface/50 backdrop-blur-sm p-6 rounded-2xl border border-game-primary/30 shadow-[0_0_30px_rgba(255,0,128,0.2)]">
                  <ScanLine size={48} className="text-game-primary animate-pulse" />
               </div>
               
               {/* Radar Sweep */}
               <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-game-accent/10 to-transparent animate-[spin_4s_linear_infinite] opacity-50 pointer-events-none"></div>
            </div>

            {/* Progress & Text */}
            <div className="space-y-4 text-center z-10 max-w-xs w-full">
              <div className="h-1.5 w-full bg-game-card rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div 
                   className="h-full bg-gradient-to-r from-game-primary to-game-accent shadow-[0_0_10px_rgba(255,0,128,0.5)] transition-all duration-300 ease-out"
                   style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                ></div>
              </div>
              <div>
                <h3 className="text-lg font-black text-game-text uppercase tracking-widest animate-pulse leading-none mb-1">
                  {LOADING_STEPS[loadingStep]}
                </h3>
                <p className="text-[10px] font-mono text-game-muted opacity-60">
                  Secure Connection: ENCRYPTED // Node: UK-LON-04
                </p>
              </div>
            </div>

            {/* Matrix Data Stream Effect */}
            <div className="absolute bottom-[-20px] left-0 right-0 text-center opacity-10 pointer-events-none mask-image-gradient-b">
               <div className="text-[8px] font-mono text-game-accent leading-tight flex justify-center gap-4">
                 <div className="flex flex-col">
                   {Array.from({length: 4}).map((_, i) => (
                     <span key={i} className="animate-pulse">{Math.random().toString(2).substr(2, 16)}</span>
                   ))}
                 </div>
                 <div className="flex flex-col">
                   {Array.from({length: 4}).map((_, i) => (
                     <span key={i} className="animate-pulse delay-75">{Math.random().toString(16).substr(2, 12).toUpperCase()}</span>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {loadingState === LoadingState.SUCCESS && analysisResult && (
          <ResultsView 
            data={analysisResult} 
            imagePreview={imagePreview}
            onReset={handleReset}
            onSave={saveItem}
            isSaved={savedItems.some(item => item.id === analysisResult.id)}
          />
        )}

        {loadingState === LoadingState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-pop-in">
             <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
               <AlertCircle size={48} className="text-red-500" />
             </div>
             <div className="text-center max-w-md">
               <h3 className="text-2xl font-black text-game-text mb-2">MISSION FAILED</h3>
               <p className="text-game-muted mb-8 font-mono text-sm">{errorMsg}</p>
               <button 
                 onClick={handleReset}
                 className="bg-game-text text-game-bg px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform uppercase tracking-widest"
               >
                 Retry Mission
               </button>
             </div>
           </div>
        )}

      </main>
    </div>
  );
}

export default App;