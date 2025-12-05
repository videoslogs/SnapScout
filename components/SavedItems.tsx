import React from 'react';
import { AnalysisResult, RarityTier } from '../types';
import { Trash2, Bookmark, ChevronRight, Trophy } from './IconComponents';

interface SavedItemsProps {
  items: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const RARITY_BORDERS: Record<RarityTier, string> = {
  Common: "border-slate-500 hover:border-slate-400",
  Uncommon: "border-green-600 hover:border-green-400",
  Rare: "border-blue-600 hover:border-blue-400",
  Epic: "border-purple-600 hover:border-purple-400",
  Legendary: "border-amber-600 hover:border-amber-400"
};

export const SavedItems: React.FC<SavedItemsProps> = ({ items, onSelect, onDelete }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 animate-pop-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-game-text flex items-center gap-2 uppercase tracking-tight">
          <Bookmark size={24} className="text-game-primary" /> My Inventory
        </h3>
        <span className="text-xs font-bold text-game-muted bg-game-card px-3 py-1 rounded-full border border-white/5">
          {items.length} Items Collected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => {
           const borderClass = RARITY_BORDERS[item.rarityTier] || RARITY_BORDERS.Common;
           
           return (
            <div 
              key={item.id || index}
              onClick={() => onSelect(item)}
              className={`group bg-game-card border ${borderClass} rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-xl`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button 
                   onClick={(e) => onDelete(item.id, e)}
                   className="p-1.5 bg-game-bg/80 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                 >
                   <Trash2 size={14} />
                 </button>
              </div>

              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-lg font-black shrink-0 bg-game-bg border border-white/5 ${item.rarityTier === 'Legendary' ? 'text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-game-muted'}`}>
                  {item.productName.substring(0,1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 rounded border ${
                        item.rarityTier === 'Legendary' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 
                        item.rarityTier === 'Epic' ? 'text-purple-500 border-purple-500/30 bg-purple-500/10' : 
                        'text-slate-400 border-slate-600 bg-slate-500/10'
                    }`}>
                      {item.rarityTier}
                    </span>
                  </div>
                  <p className="font-bold text-game-text text-sm truncate leading-tight mb-1 group-hover:text-game-accent transition-colors">
                    {item.productName}
                  </p>
                  <p className="text-xs text-game-muted truncate">
                    {item.estimatedValueRange}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};