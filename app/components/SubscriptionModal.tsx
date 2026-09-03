'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { IPO } from '../page';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SubscriptionModalProps {
  ipo: IPO;
  onClose: () => void;
}

export default function SubscriptionModal({ ipo, onClose }: SubscriptionModalProps) {
  const [viewMode, setViewMode] = useState<'BY TIMES' | 'BY BIDS'>('BY TIMES');

  const symbol = ipo.company_name.split(' ')[0].toUpperCase();

  const { data: subData, mutate, isValidating } = useSWR(
    `/api/subscription/${symbol}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const categories = subData?.categories || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1633]/90 backdrop-blur-sm text-slate-800 flex justify-center overflow-y-auto">
      <div className="w-full max-w-md min-h-screen bg-[#f1f4f9] flex flex-col shadow-2xl relative pb-10">
        
        {/* Top Header */}
        <div className="bg-[#182952] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/10 rounded-full transition text-lg"
          >
            ←
          </button>
          
          <button 
            onClick={() => mutate()}
            className="flex items-center gap-1.5 font-bold text-sm hover:text-slate-200 transition"
          >
            <span>Refresh</span>
            <span className={`text-sm ${isValidating ? 'animate-spin' : ''}`}>↻</span>
          </button>
          <div className="w-6"></div>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Brand Header Card */}
          <div className="bg-[#13234d] text-white rounded-2xl p-5 relative overflow-hidden shadow-lg border border-blue-900/50">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live Subscription
            </div>

            <h1 className="text-2xl font-black tracking-tight mt-1 mb-4 text-white font-serif">
              {symbol}
            </h1>

            <div className="flex items-center justify-between pt-2 border-t border-blue-900/60">
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                UPDATED {subData?.updated_at || '07:37 PM'}
              </div>

              <button 
                onClick={() => mutate()}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 transition"
              >
                <span>REFRESH</span>
                <span>↻</span>
              </button>
            </div>
          </div>

          {/* Overview Metrics Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Subscription
                </div>
                <div className="text-3xl font-black text-[#13234d] tracking-tight mt-0.5">
                  {subData?.total_subscription || '39.26x'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Bids
                </div>
                <div className="text-2xl font-black text-[#13234d] tracking-tight mt-0.5">
                  ₹{subData?.total_bids_cr || '12,633.02'} <span className="text-xs font-serif italic font-normal text-slate-500">Cr</span>
                </div>
              </div>
            </div>

            {/* Probability Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#13234d] text-white flex items-center justify-center font-black text-sm shadow-md">
                {subData?.allotment_chance || 11}
              </div>
              <div>
                <div className="text-xs text-slate-600 font-medium">
                  Retail is <span className="font-bold text-slate-900">{subData?.retail_times || '10.79x'}</span> — <span className="italic font-serif">likely</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  1 in {subData?.allotment_chance || 11} <span className="italic font-serif font-normal">allotment</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-0.5">
                  Limited Allotment Chance
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Retail applications received</span>
              <span className="text-slate-800">{subData?.retail_apps || '1,974,531 · 18.25x'}</span>
            </div>
          </div>

          {/* BY TIMES / BY BIDS Switch */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl w-fit border border-slate-300/60">
            {(['BY TIMES', 'BY BIDS'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all ${
                  viewMode === m
                    ? 'bg-[#13234d] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Category Breakdown Header */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base font-bold text-[#13234d] font-serif italic">
              Category breakdown
            </h2>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {categories.length || 5} Categories
            </span>
          </div>

          {/* Category Cards */}
          <div className="space-y-3">
            {categories.map((cat: any, idx: number) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 relative overflow-hidden"
              >
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#10b981] rounded-r"></div>

                <div className="flex justify-between items-start pl-1">
                  <div>
                    <h3 className="font-black text-base text-slate-900 tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                      {cat.sub}
                    </p>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {cat.times}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 text-center pl-1">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Bid Amount</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">{cat.amount}</div>
                  </div>
                  <div className="border-x border-slate-100">
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Bid Quantity</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">{cat.qty}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Times</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">{cat.times}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}