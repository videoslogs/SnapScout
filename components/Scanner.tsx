import React, { useRef, useState, useEffect } from 'react';
import { Camera, Search, ScanLine, Barcode, ExternalLink, Flame, Tag, Calendar, Gift, ShoppingCart, Percent } from './IconComponents';

interface ScannerProps {
  onImageSelect: (file: File, isBarcode: boolean) => void;
  onTextSearch: (query: string) => void;
  isLoading: boolean;
}

const TRENDING_ITEMS = [
  {
    id: 1,
    name: "Nike Air Max 90",
    price: "£45.00",
    icon: "👟",
    tag: "VINTAGE",
    link: "https://www.google.com/search?q=Nike+Air+Max+90+vintage&tbm=shop"
  },
  {
    id: 2,
    name: "Sony WH-1000XM4",
    price: "£199.00",
    icon: "🎧",
    tag: "TECH",
    link: "https://www.google.com/search?q=Sony+WH-1000XM4&tbm=shop"
  },
  {
    id: 3,
    name: "LEGO Star Wars X-Wing",
    price: "£89.99",
    icon: "🚀",
    tag: "TOYS",
    link: "https://www.google.com/search?q=lego+star+wars+x-wing&tbm=shop"
  },
  {
    id: 4,
    name: "Ninja Air Fryer Dual",
    price: "£149.00",
    icon: "🍳",
    tag: "HOME",
    link: "https://www.google.com/search?q=ninja+air+fryer+dual&tbm=shop"
  }
];

const SEASONAL_SALES = [
  { 
    event: "Amazon Daily Deals", 
    deal: "Tech & Home Discounts", 
    icon: <span className="text-yellow-400">📦</span>,
    link: "https://www.amazon.co.uk/deals" 
  },
  { 
    event: "Currys Clearance", 
    deal: "Up to 40% Off Laptops", 
    icon: <span className="text-purple-400">💻</span>,
    link: "https://www.currys.co.uk/clearance" 
  },
  { 
    event: "Argos Sale", 
    deal: "Toys & Furniture Drops", 
    icon: <span className="text-red-400">🧸</span>,
    link: "https://www.argos.co.uk/events/clearance" 
  },
  { 
    event: "eBay UK Spotlight", 
    deal: "Refurbished Tech Gems", 
    icon: <span className="text-blue-400">💎</span>,
    link: "https://www.ebay.co.uk/globaldeals" 
  },
   { 
    event: "John Lewis Offers", 
    deal: "Home & Fashion Sales", 
    icon: <span className="text-green-400">🛍️</span>,
    link: "https://www.johnlewis.com/special-offers" 
  }
];

export const Scanner: React.FC<ScannerProps> = ({ onImageSelect, onTextSearch, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [saleIndex, setSaleIndex] = useState(0);

  // Auto-cycle trending items
  useEffect(() => {
    const timer = setInterval(() => {
      setTrendingIndex((prev) => (prev + 1) % TRENDING_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  
  // Cycle Seasonal Sales
  useEffect(() => {
    const timer = setInterval(() => {
      setSaleIndex((prev) => (prev + 1) % SEASONAL_SALES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentTrending = TRENDING_ITEMS[trendingIndex];
  const currentSale = SEASONAL_SALES[saleIndex];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBarcode: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0], isBarcode);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onTextSearch(searchQuery);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-pop-in relative z-10">
      
      {/* Featured / Trending Deals Carousel */}
      <div className="bg-game-card border border-white/10 rounded-xl p-2.5 shadow-lg backdrop-blur-md relative overflow-hidden group max-w-xs mx-auto hover:border-game-primary/30 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
           {/* Icon */}
           <div className="h-9 w-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center shrink-0 text-xl shadow-inner">
              {currentTrending.icon}
           </div>
           
           {/* Text */}
           <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-black text-game-primary uppercase tracking-wider">{currentTrending.tag}</span>
                <span className="text-[8px] bg-game-success/10 text-game-success px-1 rounded border border-game-success/20 font-bold">LIVE</span>
              </div>
              <p className="text-xs font-bold text-game-text truncate leading-none mb-0.5">{currentTrending.name}</p>
              <p className="text-[10px] text-game-muted font-mono leading-none">{currentTrending.price}</p>
           </div>
           
           {/* Button */}
           <div className="shrink-0">
              <a 
                href={currentTrending.link} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-bold uppercase bg-game-surface border border-white/10 hover:bg-game-primary hover:text-white hover:border-game-primary text-game-text transition-all px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 shadow-sm"
              >
                View <ExternalLink size={10} />
              </a>
           </div>
        </div>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
           {TRENDING_ITEMS.map((_, idx) => (
             <div 
               key={idx} 
               className={`h-0.5 w-2 rounded-full transition-colors ${idx === trendingIndex ? 'bg-game-primary' : 'bg-white/10'}`} 
             />
           ))}
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-game-text via-game-accent to-game-primary tracking-tight">
          SNAP SCOUT
        </h2>
      </div>

      {/* Holographic Scanner Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-game-primary to-game-secondary rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-glow"></div>
        <div className="relative bg-game-card border border-white/10 p-1 rounded-3xl overflow-hidden shadow-2xl">
          
          <div 
             className="relative h-60 bg-game-bg rounded-[1.3rem] border-2 border-dashed border-white/10 hover:border-game-accent transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group/scan"
             onClick={() => fileInputRef.current?.click()}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-hero-pattern opacity-30 pointer-events-none"></div>
            
            {/* Scanner Line Animation */}
            <div className="absolute inset-0 w-full h-1 bg-game-accent/50 shadow-[0_0_15px_#00dfd8] animate-[float_4s_linear_infinite] top-0 opacity-0 group-hover/scan:opacity-100 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center group-hover/scan:scale-105 transition-transform duration-300">
               <div className="h-16 w-16 bg-game-surface rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-inner group-hover/scan:bg-game-card group-hover/scan:border-game-accent/50 transition-colors">
                  <Camera size={32} className="text-game-primary group-hover/scan:text-game-accent transition-colors" />
               </div>
               <p className="text-game-text font-bold text-lg tracking-wide uppercase">Initiate Scan</p>
               <p className="text-game-accent text-xs font-mono mt-1">&lt; Upload Image /&gt;</p>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, false)}
            />
          </div>

          <div className="p-3 space-y-3">
             <div className="flex gap-2">
                <form onSubmit={handleSearchSubmit} className="relative group/input flex-grow">
                  <input 
                    type="text" 
                    placeholder="Input item name or code..."
                    className="w-full h-11 pl-10 pr-12 bg-game-bg hover:bg-game-surface focus:bg-game-surface border border-white/5 focus:border-game-primary/50 rounded-xl transition-all outline-none text-game-text placeholder-game-muted font-mono text-sm shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-game-muted group-focus-within/input:text-game-primary transition-colors" size={16} />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-game-primary text-white p-1.5 rounded-lg hover:bg-game-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    disabled={isLoading || !searchQuery.trim()}
                  >
                    <Search size={16} />
                  </button>
                </form>

                {/* Barcode Scan Button */}
                <button 
                  onClick={() => barcodeInputRef.current?.click()}
                  className="flex items-center gap-2 bg-game-surface border border-white/10 hover:border-game-accent hover:bg-game-bg px-3 rounded-xl text-game-muted hover:text-game-text transition-all active:scale-95 group/barcode relative overflow-hidden"
                  title="Scan Barcode"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/barcode:animate-shimmer pointer-events-none"></div>
                  <Barcode size={22} className="group-hover/barcode:text-game-accent" />
                </button>
                <input 
                  type="file" 
                  ref={barcodeInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, true)}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Seasonal Sales Widget */}
      <div className="bg-game-card/50 p-1 rounded-2xl border border-white/5 shadow-sm hover:bg-game-card/80 transition-colors relative overflow-hidden group">
         <a 
            href={currentSale.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 w-full h-full"
         >
             <div className="h-8 w-8 rounded-full bg-game-accent/20 flex items-center justify-center shrink-0 border border-game-accent/30 animate-pulse group-hover:bg-game-accent/30 transition-colors">
                <Percent size={14} className="text-game-accent" />
             </div>
             <div className="flex-grow min-w-0 overflow-hidden relative h-8">
                {/* Ticker Animation */}
                {SEASONAL_SALES.map((item, i) => (
                  <div 
                    key={i}
                    className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ${
                      i === saleIndex 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                     <p className="text-[10px] font-bold text-game-text truncate flex items-center gap-2">
                       {item.event} <span className="text-[10px] opacity-70">{item.icon}</span>
                     </p>
                     <p className="text-[9px] text-game-primary truncate font-bold uppercase">{item.deal}</p>
                  </div>
                ))}
             </div>
             <div className="text-[9px] font-bold text-game-muted px-2 py-1 bg-game-surface rounded border border-white/5 uppercase tracking-wide group-hover:text-white group-hover:border-game-primary/30 transition-colors flex items-center gap-1 shrink-0">
               View <ExternalLink size={10} />
             </div>
         </a>
      </div>
    </div>
  );
};