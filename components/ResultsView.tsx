import React, { useState, useMemo, useEffect } from 'react';
import { AnalysisResult, RarityTier, RetailerPrice } from '../types';
import { Button } from './Button';
import { 
  TrendingUp, Check, X, Tag, Share2, ScanLine, Bookmark, 
  ExternalLink, ThumbsUp, ThumbsDown, Shield, Sword, Gem, Crown, Sparkles, Star,
  Calculator, CheckSquare, Square, Copy, Zap, Lightbulb, ChevronDown, ChevronUp,
  Package, Mail, Plus, Trash2, Edit2, List, RotateCcw, History, FileText, Search,
  Trophy, MessageSquare
} from './IconComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsViewProps {
  data: AnalysisResult;
  imagePreview: string | null;
  onReset: () => void;
  onSave: (item: AnalysisResult) => void;
  isSaved: boolean;
}

// Map rarity to colors
const RARITY_COLORS: Record<RarityTier, string> = {
  Common: "text-slate-400 border-slate-500 bg-slate-500/10",
  Uncommon: "text-green-500 border-green-500 bg-green-500/10",
  Rare: "text-blue-500 border-blue-500 bg-blue-500/10",
  Epic: "text-purple-500 border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  Legendary: "text-amber-500 border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
};

const generateMockHistory = (currentPriceStr: string) => {
  const current = parseFloat(currentPriceStr.replace(/[^0-9.]/g, '')) || 50;
  const currentYear = new Date().getFullYear();
  const history = [];
  
  // Generate data for 15 years
  for (let i = 14; i >= 0; i--) {
    const year = currentYear - i;
    // Mock random fluctuation trend
    const randomFactor = 0.6 + (Math.random() * 0.8); // 0.6 to 1.4
    // Make older prices generally lower for inflation effect, but not always
    const timeFactor = 1 - (i * 0.02); 
    
    let price = current * timeFactor * randomFactor;
    if (i === 0) price = current; // Current year matches current price

    history.push({
      year: year.toString(),
      price: parseFloat(price.toFixed(2))
    });
  }
  return history;
};

// Helper to extract domain for favicons
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

interface CollapsibleWidgetProps {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const CollapsibleWidget: React.FC<CollapsibleWidgetProps> = ({ 
  title, 
  icon: Icon, 
  iconColor = "text-game-text", 
  children, 
  defaultOpen = false,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-game-card border border-white/10 rounded-2xl overflow-hidden transition-all shadow-sm">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-game-surface/50 active:bg-game-surface"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-game-text flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
          {Icon && <Icon size={14} className={iconColor}/>} {title}
        </h3>
        <div className="text-game-muted">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {isOpen && (
        <div className="px-4 pb-4 animate-pop-in border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
};

// Retailer Row with Favicon Fallback and Competitor Comparison
const RetailerRow: React.FC<{ retailer: RetailerPrice; isCheapest: boolean }> = ({ retailer, isCheapest }) => {
  const [imgError, setImgError] = useState(false);
  
  const domain = getDomain(retailer.url);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  return (
    <a 
      href={retailer.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative bg-game-card border p-3 rounded-2xl transition-all hover:scale-[1.01] flex flex-col gap-2 overflow-hidden shadow-sm ${
        isCheapest 
          ? 'border-game-success/50 shadow-[0_0_15px_rgba(0,255,148,0.15)]' 
          : 'border-white/10 hover:border-game-accent'
      }`}
    >
      {/* AI Pick Badge with Shimmer */}
      {isCheapest && (
        <div className="absolute top-0 left-0 bg-game-success text-game-bg text-[9px] font-black px-2 py-0.5 rounded-br-lg z-20 overflow-hidden">
          <span className="relative z-10">BEST DEAL</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
        </div>
      )}
      
      <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs border overflow-hidden shrink-0 ${isCheapest ? 'bg-game-success/10 border-game-success/30' : 'bg-white/5 border-white/10'}`}>
                {/* Priority: Specific Product Image -> Favicon -> First Letter */}
                {!imgError && retailer.productImage ? (
                    <img 
                      src={retailer.productImage} 
                      alt={retailer.retailer} 
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                ) : faviconUrl ? (
                    <img 
                      src={faviconUrl} 
                      alt="logo" 
                      className="w-6 h-6 object-contain opacity-80" 
                    />
                ) : (
                    <span className="uppercase text-game-muted">{retailer.retailer.substring(0, 1)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-game-text text-sm leading-tight truncate">{retailer.retailer}</p>
                <div className="flex items-center gap-2">
                   {retailer.inStock ? (
                      <span className="text-[8px] bg-game-surface px-1.5 py-0.5 rounded text-green-400 border border-green-500/20">In Stock</span>
                    ) : (
                      <span className="text-[8px] bg-game-surface px-1.5 py-0.5 rounded text-red-400 border border-red-500/20">Check</span>
                    )}
                   {retailer.comparison && (
                      <span className="text-[8px] text-game-muted truncate hidden sm:block">
                        • {retailer.comparison}
                      </span>
                   )}
                </div>
              </div>
          </div>
          
          <div className="flex items-center gap-3 text-right">
             <p className={`font-black text-lg ${isCheapest ? 'text-game-success' : 'text-game-text'}`}>
                {retailer.price}
             </p>
             <div className="h-8 w-8 rounded-lg bg-game-surface border border-white/10 flex items-center justify-center group-hover:bg-game-accent group-hover:text-game-bg transition-colors">
                <ChevronDown size={16} className="-rotate-90" />
             </div>
          </div>
      </div>
    </a>
  );
};

interface ShoppingItem {
  id: string;
  text: string;
  status: 'active' | 'bought' | 'cancelled';
  timestamp: number;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, imagePreview, onReset, onSave, isSaved }) => {
  const priceHistory = useMemo(() => generateMockHistory(data.retailers[0]?.price || "£50"), [data]);
  const [animatedPrice, setAnimatedPrice] = useState(0);
  
  // Calculator State
  const [calcQty, setCalcQty] = useState(1);
  const [showCalc, setShowCalc] = useState(false);
  const [unitPrice, setUnitPrice] = useState(0);
  
  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Shopping List State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  
  // Image Error State
  const [mainImageError, setMainImageError] = useState(false);
  
  // Parse Title and Subtitle (Variant)
  const { mainTitle, subTitle } = useMemo(() => {
    // Find the first occurrence of parenthesis which usually indicates variant/size
    const index = data.productName.indexOf('(');
    if (index > 0) {
      return { 
        mainTitle: data.productName.substring(0, index).trim(), 
        subTitle: data.productName.substring(index).trim() 
      };
    }
    return { mainTitle: data.productName, subTitle: '' };
  }, [data.productName]);

  // Parse Price to separate brackets if present (e.g. "£2.45 (for 6)")
  const { priceDisplay, priceSuffix } = useMemo(() => {
    const val = data.estimatedValueRange;
    // Look for bracketed text like "(for 6)" or "(per kg)"
    const bracketIndex = val.indexOf('(');
    if (bracketIndex !== -1) {
      return { 
        priceDisplay: val.substring(0, bracketIndex).trim(), 
        priceSuffix: val.substring(bracketIndex).trim() 
      };
    }
    return { priceDisplay: val, priceSuffix: null };
  }, [data.estimatedValueRange]);

  // Load Shopping List
  useEffect(() => {
    const savedList = localStorage.getItem('snapscout_shopping_list');
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
           setShoppingList(parsed.map((text: string) => ({
             id: Math.random().toString(36).substr(2, 9),
             text,
             status: 'active',
             timestamp: Date.now()
           })));
        } else {
           setShoppingList(parsed);
        }
      } catch (e) {
        console.error("Failed to load shopping list", e);
      }
    }
  }, []);

  // Save Shopping List
  useEffect(() => {
    localStorage.setItem('snapscout_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const rarityColor = RARITY_COLORS[data.rarityTier] || RARITY_COLORS.Common;
  const isLegendary = data.rarityTier === 'Legendary';

  // Filter retailers with valid links (length check)
  const validRetailers = useMemo(() => {
    return data.retailers.filter(r => r.url && r.url.length > 5);
  }, [data.retailers]);

  // Find cheapest retailer
  const cheapestRetailerIndex = useMemo(() => {
    if (!validRetailers.length) return -1;
    let minPrice = Infinity;
    let minIndex = -1;
    validRetailers.forEach((r, idx) => {
      const price = parseFloat(r.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(price) && price < minPrice) {
        minPrice = price;
        minIndex = idx;
      }
    });
    return minIndex;
  }, [validRetailers]);
  
  const cheapestRetailer = cheapestRetailerIndex !== -1 ? validRetailers[cheapestRetailerIndex] : null;
  const winnerDomain = cheapestRetailer ? getDomain(cheapestRetailer.url) : '';
  const winnerFavicon = winnerDomain ? `https://www.google.com/s2/favicons?domain=${winnerDomain}&sz=128` : null;

  const bestPriceValue = cheapestRetailerIndex !== -1 
    ? parseFloat(validRetailers[cheapestRetailerIndex].price.replace(/[^0-9.]/g, '')) 
    : 0;
    
  // Initialize editable unit price
  useEffect(() => {
      if (bestPriceValue > 0) {
          setUnitPrice(bestPriceValue);
      }
  }, [bestPriceValue]);

  // Determine display image: User Upload > Cheapest Retailer Image > Placeholder
  const displayImage = useMemo(() => {
      if (imagePreview) return imagePreview;
      if (cheapestRetailerIndex !== -1 && validRetailers[cheapestRetailerIndex].productImage) {
          return validRetailers[cheapestRetailerIndex].productImage;
      }
      return null;
  }, [imagePreview, validRetailers, cheapestRetailerIndex]);

  // Animate Market Value appearance
  useEffect(() => {
    const match = data.estimatedValueRange.match(/[\d.]+/);
    if (match) {
      const target = parseFloat(match[0]);
      let start = 0;
      const duration = 1000;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        setAnimatedPrice(start);
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [data.estimatedValueRange]);

  const handleShare = async () => {
    const shareData = {
      title: data.productName,
      text: `Found this item: ${data.productName} (${data.rarityTier}) - Value: ${data.estimatedValueRange}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
        // Fallback to WhatsApp direct link
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`;
        window.open(whatsappUrl, '_blank');
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const sendFeedback = (type: 'positive' | 'negative') => {
    const subject = type === 'positive' ? 'SnapScout Feedback: Helpful Item!' : 'SnapScout Feedback: Bad Intel';
    const body = `Product ID: ${data.id}\nProduct: ${data.productName}\n\nMy feedback:`;
    window.location.href = `mailto:videlogs@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Shopping List Handlers
  const addShoppingItem = () => {
    if (newItemText.trim()) {
      const newItem: ShoppingItem = {
        id: Math.random().toString(36).substr(2, 9),
        text: newItemText.trim(),
        status: 'active',
        timestamp: Date.now()
      };
      setShoppingList(prev => [newItem, ...prev]);
      setNewItemText('');
    }
  };

  const updateItemStatus = (id: string, status: 'bought' | 'cancelled' | 'active') => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, status, timestamp: Date.now() } : item
    ));
  };

  const deletePermanently = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setShoppingList(prev => prev.filter(item => item.status === 'active'));
  };

  const activeItems = useMemo(() => 
    shoppingList.filter(i => i.status === 'active').sort((a,b) => b.timestamp - a.timestamp), 
  [shoppingList]);
  
  const historyItems = useMemo(() => 
    shoppingList.filter(i => i.status !== 'active').sort((a,b) => b.timestamp - a.timestamp), 
  [shoppingList]);

  // Helper to get visual Rank Badge
  const getRankBadge = (tier: RarityTier) => {
    const baseStyle = "absolute top-4 right-4 flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 shadow-xl backdrop-blur-md z-20";
    
    switch (tier) {
      case 'Legendary':
        return (
          <div className={`${baseStyle} bg-amber-500/20 border-amber-500 text-amber-500`}>
            <Crown size={20} fill="currentColor" className="drop-shadow-sm animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">Legend</span>
          </div>
        );
      case 'Epic':
        return (
          <div className={`${baseStyle} bg-purple-500/20 border-purple-500 text-purple-500`}>
            <Gem size={20} fill="currentColor" className="drop-shadow-sm" />
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">Epic</span>
          </div>
        );
      case 'Rare':
        return (
          <div className={`${baseStyle} bg-blue-500/20 border-blue-500 text-blue-500`}>
            <Star size={20} fill="currentColor" className="drop-shadow-sm" />
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">Rare</span>
          </div>
        );
      case 'Uncommon':
        return (
          <div className={`${baseStyle} bg-green-500/20 border-green-500 text-green-500`}>
            <Sparkles size={20} className="drop-shadow-sm" />
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">Uncommon</span>
          </div>
        );
      default: // Common / Base -> REVIEW SCORE
        return (
          <div className={`${baseStyle} bg-slate-500/20 border-slate-400 text-slate-300`}>
            <Star size={18} fill="currentColor" className="drop-shadow-sm text-yellow-500" />
            <span className="text-[7px] font-black uppercase tracking-wider mt-0.5 text-white">4.8/5</span>
          </div>
        );
    }
  };

  return (
    <div className="pb-32 animate-pop-in">
      
      {/* Top Action Bar - Sticky and Always Visible */}
      <div className="sticky top-16 z-30 bg-game-bg/95 backdrop-blur-md py-3 -mx-4 px-4 mb-6 border-b border-white/5 flex justify-between items-center shadow-2xl transition-all">
        <button 
          onClick={onReset} 
          className="flex items-center gap-2 text-game-primary hover:text-game-accent transition-colors text-xs font-black uppercase tracking-wider group animate-pulse filter drop-shadow-[0_0_8px_rgba(255,0,128,0.5)]"
        >
          <ScanLine size={16} className="group-hover:rotate-180 transition-transform"/> New Scan
        </button>
        <div className="flex gap-2">
           <button 
             onClick={() => onSave(data)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wide ${
               isSaved 
               ? 'bg-game-success/20 text-game-success border-game-success' 
               : 'bg-game-card text-game-muted border-white/10 hover:border-game-muted hover:text-game-text'
             }`}
           >
             {isSaved ? <Check size={14} /> : <Bookmark size={14} />}
             {isSaved ? 'Saved' : 'Quick Save'}
           </button>
           <button 
             onClick={handleShare}
             className="p-1.5 rounded-full bg-game-card border border-white/10 text-game-muted hover:text-game-text hover:border-game-muted transition-all active:scale-95"
           >
             <Share2 size={16} />
           </button>
        </div>
      </div>

      {/* Main Item Card */}
      <div className={`relative bg-game-card rounded-[2rem] overflow-hidden border ${isLegendary ? 'border-amber-500/50' : 'border-white/10'} shadow-xl mb-6`}>
        {/* Rarity Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Image Area */}
        <div className="relative h-64 bg-gradient-to-b from-game-surface to-game-bg flex items-center justify-center p-6 group overflow-hidden">
           {isLegendary && <div className="absolute inset-0 bg-amber-500/10 animate-pulse-glow pointer-events-none"></div>}
           
           {!mainImageError && displayImage ? (
             <img 
               src={displayImage} 
               alt="Item" 
               className={`h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 ${isLegendary ? 'animate-float' : ''}`}
               onError={() => setMainImageError(true)} 
             />
           ) : cheapestRetailer ? (
             // WINNER STATE (Cheapest Merchant)
             <div className="flex flex-col items-center justify-center text-center animate-pop-in z-10">
                <div className="relative mb-3 group/winner cursor-pointer hover:scale-105 transition-transform">
                   <div className="absolute inset-0 bg-game-success/20 rounded-2xl blur-xl animate-pulse"></div>
                   <div className="h-24 w-24 bg-game-card rounded-2xl border-2 border-game-success/50 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,148,0.2)] relative z-10 overflow-hidden bg-white/5">
                      {winnerFavicon ? (
                         <img src={winnerFavicon} alt={cheapestRetailer.retailer} className="w-12 h-12 object-contain opacity-100" />
                      ) : (
                         <span className="text-3xl font-black text-game-text uppercase">{cheapestRetailer.retailer.substring(0, 1)}</span>
                      )}
                      <div className="absolute -top-1 -right-1 bg-game-success text-game-bg p-1 rounded-bl-lg shadow-lg z-20">
                        <Trophy size={14} fill="currentColor" />
                      </div>
                   </div>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-game-success uppercase tracking-widest bg-game-success/10 px-2 py-0.5 rounded-full inline-block border border-game-success/20">Best Deal Found</p>
                   <p className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-shimmer bg-[length:200%_auto] text-transparent bg-clip-text tracking-tight drop-shadow-sm">{cheapestRetailer.price}</p>
                   <p className="text-[10px] text-game-muted uppercase font-bold tracking-wide">at {cheapestRetailer.retailer}</p>
                </div>
             </div>
           ) : (
             // FALLBACK GAMIFIED STATE (No Data)
             <div className="flex flex-col items-center justify-center text-game-muted/50">
               <div className="relative">
                 <div className="absolute inset-0 bg-game-primary/20 rounded-full blur-xl animate-pulse"></div>
                 <div className="p-6 bg-game-bg/50 rounded-2xl border border-white/5 shadow-inner relative z-10">
                    <Shield size={64} strokeWidth={1} className="text-game-primary/60 animate-pulse" />
                 </div>
               </div>
               <p className="mt-4 font-mono text-[10px] tracking-[0.2em] uppercase opacity-70 flex items-center gap-2 text-game-primary/70">
                 <span className="w-1.5 h-1.5 bg-game-primary rounded-full animate-ping"></span>
                 Classified Intel
               </p>
             </div>
           )}

           {/* Rarity Rank Badge */}
           {getRankBadge(data.rarityTier)}
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
           {/* Full Title Box - Refined */}
           <div className="w-full bg-game-surface/20 rounded-2xl p-4 border border-white/5 shadow-sm relative overflow-hidden pr-12">
              <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                 <Tag size={48} />
              </div>
              
              {/* Tiny Web Search Button in Corner */}
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(data.productName)}`} 
                target="_blank" 
                rel="noreferrer"
                className="absolute top-3 right-3 shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-game-surface border border-game-accent/30 text-game-accent hover:bg-game-accent hover:text-game-bg transition-all shadow-[0_0_10px_rgba(0,223,216,0.1)] z-20"
                title="Search Web"
              >
                <Search size={14} strokeWidth={3} /> 
              </a>

              <div className="relative z-10">
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-game-primary tracking-widest uppercase mb-1 flex items-center gap-1.5">
                       <Tag size={10} /> {data.category}
                    </p>
                    <h1 className="text-lg md:text-xl font-black text-game-text leading-tight tracking-tight break-words drop-shadow-sm">
                       {mainTitle}
                    </h1>
                 </div>
              </div>
           </div>

           {/* Market Value Box - COMPACT */}
           <div className="w-full bg-game-bg/40 py-2 px-4 flex flex-col items-center justify-center rounded-2xl border border-white/10 shadow-inner mt-2 relative overflow-hidden min-h-[5rem]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-game-surface/20 pointer-events-none"></div>
              
              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/20 opacity-50"></div>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/20 opacity-50"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/20 opacity-50"></div>
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/20 opacity-50"></div>
              
              {/* Price First - Prominent */}
              <div className="relative z-10 w-full text-center mb-0 flex flex-col items-center">
                 <p className="text-4xl sm:text-5xl font-black text-game-text leading-none tracking-tight">
                   {priceDisplay}
                 </p>
                 {/* Price Suffix (e.g. per 6) & Subtitle (Variant Info) - TIGHT UNDER PRICE */}
                 <div className="flex flex-col items-center gap-0 mt-0.5 leading-none">
                     {priceSuffix && (
                        <p className="text-[9px] font-bold text-game-muted uppercase tracking-wide opacity-80">
                            {priceSuffix}
                        </p>
                     )}
                     {subTitle && (
                        <p className="text-[9px] font-bold text-game-muted uppercase tracking-wide opacity-80">
                            {subTitle}
                        </p>
                     )}
                 </div>
              </div>

              {/* Container for sub-details to keep them tight */}
              <div className="flex flex-col items-center gap-0.5 relative z-10 opacity-80 mt-1 pb-1">
                  <p className="text-[7px] text-game-muted uppercase font-bold tracking-[0.2em] leading-none mb-0.5 mt-2">Market Value Estimate</p>
                  
                  {/* Details Inside Box - Tiny */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[8px] font-mono text-game-muted">
                     <span className="flex items-center gap-1 text-game-success">
                        <Zap size={8} fill="currentColor" /> {data.confidenceScore}% Confidence
                     </span>
                     {data.specs.releaseYear && (
                       <span className="text-game-muted/50">•</span>
                     )}
                     {data.specs.releaseYear && (
                       <span>
                         EST. {data.specs.releaseYear}
                       </span>
                     )}
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* PRIORITY: Merchant Offers (Retailers) */}
      <div className="mb-6">
         <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-game-text flex items-center gap-2">
                <Tag className="text-game-accent" size={20} /> Merchant Offers
            </h2>
            {/* Simple Calculator Toggle */}
            <button 
              onClick={() => setShowCalc(!showCalc)}
              className="flex items-center gap-2 text-[10px] font-bold text-game-muted hover:text-game-text bg-game-card border border-white/5 hover:border-game-muted px-2.5 py-1 rounded-full transition-colors"
            >
              <Calculator size={12} /> {showCalc ? 'Hide Calc' : 'Cost Calc'}
            </button>
         </div>

         {/* Calculator Widget */}
         {showCalc && (
           <div className="mb-4 bg-game-surface/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4 animate-pop-in">
             <div className="flex-1">
               <label className="text-[10px] text-game-muted uppercase font-bold">Qty</label>
               <input 
                 type="number" 
                 min="1" 
                 value={calcQty} 
                 onChange={(e) => setCalcQty(parseInt(e.target.value) || 1)}
                 className="w-full bg-game-bg border border-white/10 rounded-lg px-3 py-1 text-game-text font-mono text-sm"
               />
             </div>
             <div className="flex-1">
               <label className="text-[10px] text-game-muted uppercase font-bold">Unit (£)</label>
               <input 
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-game-bg border border-white/10 rounded-lg px-3 py-1 text-game-text font-mono text-sm"
               />
             </div>
             <div className="flex-1 text-right">
               <label className="text-[10px] text-game-muted uppercase font-bold">Total</label>
               <div className="text-lg font-black text-game-accent">£{(unitPrice * calcQty).toFixed(2)}</div>
             </div>
           </div>
         )}

         <div className="grid grid-cols-1 gap-3">
            {validRetailers.length > 0 ? validRetailers.map((retailer, idx) => {
               const isCheapest = idx === cheapestRetailerIndex;
               return <RetailerRow key={idx} retailer={retailer} isCheapest={isCheapest} />;
            }) : (
              <div className="text-center p-4 text-game-muted text-sm border border-white/5 rounded-xl border-dashed">
                No active offers found.
              </div>
            )}
         </div>
      </div>

      {/* MOTHER DROPDOWN: Detailed Analysis */}
      <CollapsibleWidget title="Detailed Analysis" icon={FileText} iconColor="text-game-primary" defaultOpen={false} className="mb-6">
         <div className="space-y-6 pt-4">

             {/* Product Intel (Description + Suggestion) */}
             <div className="space-y-4">
                 <h4 className="text-xs font-bold text-game-text uppercase tracking-widest border-b border-white/5 pb-2">Product Intel</h4>
                 {/* AI Quick Suggestion */}
                 {data.buyingTip && (
                    <div className="bg-gradient-to-r from-game-secondary/10 to-game-primary/10 border border-game-secondary/20 rounded-xl p-3 flex gap-3 items-start">
                       <div className="bg-game-secondary/20 p-1.5 rounded-lg text-game-secondary mt-0.5 shrink-0">
                         <Lightbulb size={16} />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-game-secondary uppercase tracking-wider mb-0.5">Quick AI Suggestion</p>
                         <p className="text-xs text-game-text leading-relaxed font-medium">{data.buyingTip}</p>
                       </div>
                    </div>
                 )}

                 {/* Description */}
                 <div>
                    <h5 className="text-[10px] text-game-muted uppercase font-bold mb-1">Briefing</h5>
                    <p className="text-xs text-game-text leading-relaxed font-light tracking-wide opacity-90">
                      {data.description}
                    </p>
                 </div>
             </div>

             {/* Combat Stats (Buffs/Debuffs) */}
             <div>
                <h4 className="text-xs font-bold text-game-text uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Combat Stats</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-game-bg/30 rounded-xl p-3 border border-white/5">
                       <h3 className="text-game-success font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Shield size={12} /> Buffs
                       </h3>
                       <ul className="space-y-1.5">
                          {data.pros.slice(0,3).map((pro, i) => (
                             <li key={i} className="text-[11px] text-game-muted flex items-start gap-1.5 leading-tight">
                                <span className="text-game-success font-bold">+</span> {pro}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="bg-game-bg/30 rounded-xl p-3 border border-white/5">
                       <h3 className="text-game-primary font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Sword size={12} /> Debuffs
                       </h3>
                       <ul className="space-y-1.5">
                          {data.cons.slice(0,3).map((con, i) => (
                             <li key={i} className="text-[11px] text-game-muted flex items-start gap-1.5 leading-tight">
                                <span className="text-game-primary font-bold">-</span> {con}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
             </div>

             {/* Tech Specs */}
             <div>
                  <h4 className="text-xs font-bold text-game-text uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Attributes</h4>
                  <div className="grid grid-cols-2 gap-2">
                      {Object.entries(data.specs).map(([key, value]) => value && (
                          <div key={key} className="bg-game-bg/50 p-2 rounded-xl border border-white/5 overflow-hidden">
                              <p className="text-[9px] text-game-muted uppercase tracking-wider mb-0.5 opacity-70 break-words">{key}</p>
                              <p className="text-game-text font-bold text-xs truncate">{value}</p>
                          </div>
                      ))}
                  </div>
             </div>

            {/* Price History */}
            <div>
                  <h4 className="text-xs font-bold text-game-text uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Value History (15 Years)</h4>
                  <div className="bg-game-surface/50 rounded-xl p-3 h-40 w-full border border-white/5">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={priceHistory}>
                              <XAxis 
                                dataKey="year" 
                                fontSize={9} 
                                tick={{fill: 'var(--game-muted)', fontWeight: 600}} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={5}
                                interval={2} // Show every 2nd year to avoid clutter
                              />
                              <YAxis 
                                fontSize={9}
                                tick={{fill: 'var(--game-muted)', fontWeight: 600}}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `£${value}`}
                                width={35}
                              />
                              <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'var(--game-card)', 
                                    borderRadius: '12px', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: 'var(--game-text)', 
                                    fontSize: '10px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                  }}
                                  itemStyle={{ color: 'var(--game-accent)' }}
                                  cursor={{fill: 'rgba(255,255,255,0.05)', radius: 4}}
                                  formatter={(value: number) => [`£${value}`, 'Price']}
                              />
                              <Bar dataKey="price" radius={[4, 4, 4, 4]}>
                                  {priceHistory.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={index === priceHistory.length - 1 ? '#00dfd8' : '#7928ca'} 
                                      />
                                  ))}
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
            </div>

            {/* Complete the Set / Similar Items CAROUSEL */}
            <div>
                <h4 className="text-xs font-bold text-game-text uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Similar Items</h4>
                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar snap-x snap-mandatory">
                  {data.relatedProducts.map((item, index) => (
                    <div 
                      key={index} 
                      onClick={() => toggleCheck(index)}
                      className={`min-w-[160px] snap-center flex flex-col justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        checkedItems[index] 
                          ? 'bg-game-primary/10 border-game-primary/50' 
                          : 'bg-game-bg/50 border-white/5 hover:bg-game-surface hover:border-game-accent/50'
                      }`}
                    >
                      <div>
                          <div className={`text-game-muted transition-colors mb-2 ${checkedItems[index] ? 'text-game-primary' : ''}`}>
                            {checkedItems[index] ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <p className={`font-bold text-xs leading-tight mb-1 ${checkedItems[index] ? 'text-game-primary line-through' : 'text-game-text'}`}>
                              {item.name}
                          </p>
                          <p className="text-[9px] text-game-muted leading-tight">{item.reason}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5 text-right">
                          <p className="text-[10px] font-black text-game-accent">{item.estimatedPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            {/* Shopping List Section */}
            <div>
                 <h4 className="text-xs font-bold text-game-text uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Shopping List</h4>
                 <div className="bg-game-bg/30 border border-white/10 rounded-xl p-3 shadow-inner">
                     {/* Input Area */}
                     <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()}
                          placeholder="Add item..."
                          className="flex-grow bg-game-bg border border-white/10 rounded-xl px-3 py-2 text-xs text-game-text focus:border-game-primary/50 outline-none placeholder-game-muted/50"
                        />
                        <button 
                          onClick={addShoppingItem} 
                          className="bg-game-surface hover:bg-game-primary text-white p-2 rounded-xl transition-colors border border-white/10"
                        >
                          <Plus size={16} />
                        </button>
                     </div>

                     {/* Active List */}
                     <div className="space-y-2 mb-4">
                        {activeItems.length === 0 && (
                           <p className="text-[10px] text-game-muted text-center italic py-2">No active items.</p>
                        )}
                        {activeItems.map((item) => (
                           <div key={item.id} className="flex items-center justify-between bg-game-bg/50 px-3 py-2 rounded-xl border border-white/5 group hover:border-white/20 transition-colors">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-grow"
                                onClick={() => updateItemStatus(item.id, 'bought')}
                              >
                                 <Square size={16} className="text-game-muted group-hover:text-game-success transition-colors" />
                                 <span className="text-xs text-game-text font-medium">{item.text}</span>
                              </div>
                              <button 
                                onClick={() => updateItemStatus(item.id, 'cancelled')} 
                                className="text-game-muted hover:text-red-400 p-1"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                           </div>
                        ))}
                     </div>

                     {/* History */}
                     {historyItems.length > 0 && (
                       <div className="border-t border-white/5 pt-3">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-[10px] text-game-muted uppercase font-bold flex items-center gap-1">
                               <History size={10} /> History
                             </p>
                             <button onClick={clearHistory} className="text-[10px] text-game-muted hover:text-game-text underline">
                               Clear
                             </button>
                          </div>
                          <div className="space-y-1.5 opacity-70 hover:opacity-100 transition-opacity">
                             {historyItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-lg border border-transparent hover:border-white/5">
                                   <div className="flex items-center gap-2">
                                      {item.status === 'bought' ? (
                                         <CheckSquare size={12} className="text-game-success" />
                                      ) : (
                                         <X size={12} className="text-red-400" />
                                      )}
                                      <span className={`text-[10px] ${item.status === 'bought' ? 'text-game-success line-through' : 'text-red-400 line-through'}`}>
                                         {item.text}
                                      </span>
                                   </div>
                                   <div className="flex gap-2">
                                      <button 
                                        onClick={() => updateItemStatus(item.id, 'active')} 
                                        className="text-game-muted hover:text-game-accent"
                                        title="Restore"
                                      >
                                         <RotateCcw size={10} />
                                      </button>
                                      <button 
                                        onClick={() => deletePermanently(item.id)} 
                                        className="text-game-muted hover:text-red-400"
                                        title="Delete"
                                      >
                                         <Trash2 size={10} />
                                      </button>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                     )}
                 </div>
            </div>

         </div>
      </CollapsibleWidget>
      
      {/* Feedback Section */}
      <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-game-muted uppercase font-bold tracking-widest mb-4">Was this mission successful?</p>
          <div className="flex justify-center gap-3">
              <button 
                onClick={() => sendFeedback('positive')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-game-success/10 hover:bg-game-success/20 text-game-success border border-game-success/20 hover:border-game-success/40 transition-all active:scale-95"
              >
                  <ThumbsUp size={16} /> Good Intel
              </button>
              <button 
                onClick={() => sendFeedback('negative')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all active:scale-95"
              >
                  <Mail size={16} /> Report Issue
              </button>
          </div>
          <p className="text-[10px] text-game-muted mt-4 opacity-50">Feedback sent to videlogs@gmail.com</p>
      </div>

    </div>
  );
};