import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { ResultsView } from './components/ResultsView';
import { SavedItems } from './components/SavedItems';
import { analyzeImage, analyzeText, fileToBase64 } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { 
  ScanLine, AlertCircle, Gamepad2, Settings, X, Trash2, FileText, 
  ShieldCheck, Sun, Moon, Info, Camera, Zap, Trophy, ChevronRight 
} from './components/IconComponents';

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

// --- LANDING PAGE COMPONENT ---
const LandingPage = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-[100dvh] bg-game-bg flex flex-col items-center justify-start md:justify-center p-4 md:p-6 relative overflow-y-auto overflow-x-hidden font-sans text-game-text selection:bg-game-primary selection:text-white scroll-smooth">
    {/* Background effects */}
    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-game-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-game-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
    
    <div className="max-w-6xl w-full z-10 space-y-6 md:space-y-16 animate-pop-in pb-8 pt-4 md:pt-0">
        {/* Hero Section */}
        <div className="text-center space-y-6 md:space-y-8 mt-2 md:mt-10">
            <div className="inline-block relative">
               <h1 className="text-5xl md:text-8xl font-black text-game-text tracking-tighter mb-2 relative z-10">
                 SNAP<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-accent">SCOUT</span>
               </h1>
               <div className="absolute -inset-4 bg-game-primary/20 blur-3xl rounded-full opacity-50 z-0"></div>
            </div>
            
            <p className="text-lg md:text-2xl text-game-muted max-w-2xl mx-auto font-light leading-relaxed px-2">
              The Ultimate <span className="text-game-text font-bold">UK Price Tracker</span>. <br className="hidden md:inline"/>
              Identify items instantly. Compare prices.
            </p>
            
            <button
              onClick={onStart}
              className="group relative inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-game-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,0,128,0.4)] hover:shadow-[0_0_50px_rgba(255,0,128,0.6)] text-base md:text-lg"
            >
               Initiate Scan <ScanLine size={20} className="group-hover:rotate-180 transition-transform" />
            </button>
        </div>

        {/* How it works / Screenshots */}
        <div className="space-y-4 md:space-y-8">
            <div className="flex items-center justify-center gap-4 opacity-70">
                <div className="h-px bg-white/20 w-8 md:w-12"></div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-game-muted">System Workflow</span>
                <div className="h-px bg-white/20 w-8 md:w-12"></div>
            </div>

            {/* Mobile: Horizontal Scroll | Desktop: Grid */}
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-12 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 no-scrollbar px-1 -mx-4 md:mx-0 md:px-0">
                
                {/* Step 1: Scan */}
                <div className="group relative min-w-[85vw] md:min-w-0 snap-center pl-4 md:pl-0">
                   <div className="absolute inset-0 bg-game-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                   <div className="bg-game-card border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-sm relative hover:-translate-y-2 transition-transform duration-300 text-left h-full">
                       <div className="aspect-[16/9] md:aspect-[9/16] bg-game-bg rounded-2xl border border-white/10 mb-4 md:mb-6 relative overflow-hidden flex flex-col shadow-inner">
                          {/* Mock UI: Camera */}
                          <div className="absolute top-4 inset-x-4 flex justify-between">
                             <div className="h-1 w-8 bg-white/10 rounded-full"></div>
                             <div className="h-4 w-4 rounded-full border border-game-success/50"></div>
                          </div>
                          <div className="flex-1 flex items-center justify-center relative">
                             <div className="absolute inset-8 border-2 border-dashed border-white/20 rounded-xl"></div>
                             <Camera size={32} className="text-game-muted opacity-50" />
                          </div>
                       </div>
                       <h3 className="text-lg md:text-xl font-black text-game-text mb-2 flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-game-surface border border-white/10 text-xs md:text-sm">1</span>
                         Snap Photo
                       </h3>
                       <p className="text-xs md:text-sm text-game-muted leading-relaxed">
                         Take a picture of any product or barcode. Neural engine locks on instantly.
                       </p>
                   </div>
                </div>

                {/* Step 2: Analyze */}
                <div className="group relative min-w-[85vw] md:min-w-0 snap-center">
                   <div className="absolute inset-0 bg-game-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                   <div className="bg-game-card border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-sm relative hover:-translate-y-2 transition-transform duration-300 delay-100 text-left h-full">
                       <div className="aspect-[16/9] md:aspect-[9/16] bg-game-bg rounded-2xl border border-white/10 mb-4 md:mb-6 relative overflow-hidden flex flex-col items-center justify-center shadow-inner gap-4 p-6">
                          {/* Mock UI: Analysis */}
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-t-game-accent border-r-transparent border-b-game-accent border-l-transparent animate-spin"></div>
                          <div className="space-y-2 w-full max-w-[100px]">
                            <div className="h-1 w-full bg-game-surface rounded-full overflow-hidden">
                              <div className="h-full w-2/3 bg-game-accent animate-pulse"></div>
                            </div>
                          </div>
                          <Zap size={24} className="text-game-accent absolute opacity-20" />
                       </div>
                       <h3 className="text-lg md:text-xl font-black text-game-text mb-2 flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-game-surface border border-white/10 text-xs md:text-sm">2</span>
                         AI Analysis
                       </h3>
                       <p className="text-xs md:text-sm text-game-muted leading-relaxed">
                         Gemini Vision AI identifies the model, specs, and rates rarity.
                       </p>
                   </div>
                </div>

                {/* Step 3: Results */}
                <div className="group relative min-w-[85vw] md:min-w-0 snap-center pr-4 md:pr-0">
                   <div className="absolute inset-0 bg-game-success/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                   <div className="bg-game-card border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-sm relative hover:-translate-y-2 transition-transform duration-300 delay-200 text-left h-full">
                       <div className="aspect-[16/9] md:aspect-[9/16] bg-game-bg rounded-2xl border border-white/10 mb-4 md:mb-6 relative overflow-hidden flex flex-col shadow-inner">
                          {/* Mock UI: Results */}
                          <div className="h-full flex flex-col justify-center p-4 text-center">
                             <div className="text-[10px] text-game-success font-bold uppercase tracking-wider mb-1">Best Deal</div>
                             <div className="text-3xl font-black text-game-text mb-2">£45</div>
                             <div className="h-6 w-24 bg-game-surface/50 mx-auto rounded border border-white/5"></div>
                          </div>
                       </div>
                       <h3 className="text-lg md:text-xl font-black text-game-text mb-2 flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-game-surface border border-white/10 text-xs md:text-sm">3</span>
                         Save Money
                       </h3>
                       <p className="text-xs md:text-sm text-game-muted leading-relaxed">
                         Compare live prices from Amazon, eBay, and local shops.
                       </p>
                   </div>
                </div>
            </div>
            
            {/* Mobile Scroll Indicator */}
             <div className="flex md:hidden justify-center gap-1.5 opacity-30 py-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-game-text"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
             </div>
        </div>

        {/* Testimonials Section */}
        <div className="space-y-4 md:space-y-8 pb-8 md:pb-12">
            <div className="flex items-center justify-center gap-4 opacity-70">
                <div className="h-px bg-white/20 w-8 md:w-12"></div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-game-muted">Field Reports</span>
                <div className="h-px bg-white/20 w-8 md:w-12"></div>
            </div>
            
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 no-scrollbar px-1 -mx-4 md:mx-0 md:px-0">
               {[
                 {
                   text: "Found a vintage camera for £20. Sold for £150!",
                   author: "Sarah J.",
                   role: "Reseller"
                 },
                 {
                   text: "Saved me loads at CEX on trade-ins.",
                   author: "Mike T.",
                   role: "Tech User"
                 },
                 {
                   text: "Identified a missing LEGO figure instantly.",
                   author: "David R.",
                   role: "Collector"
                 }
               ].map((t, i) => (
                 <div key={i} className={`bg-game-surface/30 p-5 rounded-2xl border border-white/5 relative min-w-[70vw] md:min-w-0 snap-center ${i===0?'pl-5':''} ${i===2?'pr-5':''}`}>
                    <div className="text-game-primary text-4xl font-serif absolute top-2 left-3 opacity-20">"</div>
                    <p className="text-xs md:text-sm text-game-muted italic mb-3 relative z-10 pt-2 leading-relaxed">{t.text}</p>
                    <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                       <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-game-primary/20 flex items-center justify-center text-game-primary font-bold text-[10px] md:text-xs border border-game-primary/30">
                         {t.author.charAt(0)}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-game-text">{t.author}</p>
                          <p className="text-[9px] md:text-[10px] text-game-accent uppercase tracking-wider">{t.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
        </div>
        
        <div className="text-center pb-4 md:pb-10">
           <p className="text-[10px] text-game-muted font-mono opacity-50">v2.2.0 // UK REGION // SECURE</p>
        </div>
    </div>
  </div>
);

function App() {
  const [showLanding, setShowLanding] = useState(true);
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
    // Check for landing page preference
    const hasVisited = sessionStorage.getItem('snapscout_visited');
    if (hasVisited) {
       setShowLanding(false);
    }
    
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

  const handleStartApp = () => {
    setShowLanding(false);
    sessionStorage.setItem('snapscout_visited', 'true');
  };

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

  const handleGoHome = () => {
    setLoadingState(LoadingState.IDLE);
    setAnalysisResult(null);
    setImagePreview(null);
    setErrorMsg(null);
    setShowLanding(true);
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

  // RENDER LANDING PAGE IF ACTIVE
  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />;
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
          <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={handleGoHome}>
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