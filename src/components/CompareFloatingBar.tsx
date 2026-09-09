import React from 'react';
import { Layers, ArrowLeft, Trash2 } from 'lucide-react';
import { Listing } from '../types.ts';

interface CompareFloatingBarProps {
  comparedListings: Listing[];
  onOpenCompare: () => void;
  onClearCompare: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  comparedListings,
  onOpenCompare,
  onClearCompare,
}) => {
  if (comparedListings.length < 2) return null;

  return (
    <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#17140F] text-[#FAF7F1] border border-[#3D3425] shadow-2xl rounded-2xl p-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-4 max-w-lg mx-auto">
        
        {/* Count & Thumbnails */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C9A15E] text-[#17140F] flex items-center justify-center font-bold text-xs shrink-0">
            {comparedListings.length}
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm block text-[#FAF7F1]">
              تم تحديد {comparedListings.length} شقق للمقارنة
            </span>
            <span className="text-[11px] text-[#C9A15E]">
              (الحد الأقصى 4 شقق)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearCompare}
            className="p-2 rounded-xl text-[#FAF7F1]/70 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="مسح المقارنة"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCompare}
            className="bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>قارن الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
