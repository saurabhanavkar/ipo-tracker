'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { IPO } from '../page';
import SubscriptionModal from './SubscriptionModal';
import AllotmentModal from './AllotmentModal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function IPOClientView({ initialIpos }: { initialIpos: IPO[] }) {
  const { data: ipos, isValidating } = useSWR<IPO[]>('/api/ipos', fetcher, {
    fallbackData: initialIpos,
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const [activeCategory, setActiveCategory] = useState<'All' | 'Mainline' | 'SME'>('All');
  const [activeStatus, setActiveStatus] = useState<'All' | 'Current' | 'Upcoming' | 'Closed'>('All');
  const [search, setSearch] = useState('');
  
  // Modal tracking states
  const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null);
  const [subscriptionIpo, setSubscriptionIpo] = useState<IPO | null>(null);
  const [allotmentIpo, setAllotmentIpo] = useState<IPO | null>(null);

  const currentList = ipos || initialIpos;

  // Filter for Category, Status, Search, and strict 14-day window from today
  const filteredIpos = useMemo(() => {
    const now = new Date();
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(now.getDate() + 14);

    return currentList.filter((item) => {
      // 1. Text & Category Matches
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchStat = activeStatus === 'All' || item.status === activeStatus;
      const matchQuery =
        item.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      if (!matchCat || !matchStat || !matchQuery) return false;

      // 2. Date Filtering (Next 14 days or active now)
      const openTime = Date.parse(item.open_date);
      const closeTime = Date.parse(item.close_date);

      if (isNaN(openTime) && isNaN(closeTime)) {
        return item.status === 'Current' || item.status === 'Upcoming';
      }

      const openDate = isNaN(openTime) ? new Date() : new Date(openTime);
      const closeDate = isNaN(closeTime) ? openDate : new Date(closeTime);

      const isActiveNow = closeDate >= now && openDate <= now;
      const isUpcomingIn14Days = openDate >= now && openDate <= fourteenDaysLater;

      return isActiveNow || isUpcomingIn14Days;
    });
  }, [currentList, activeCategory, activeStatus, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#101b42] border border-blue-900/40 p-4 rounded-2xl mb-6 shadow-md">
        <div className="flex bg-[#0a1128] p-1 rounded-xl border border-blue-900/50 w-full sm:w-auto">
          {(['All', 'Mainline', 'SME'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-extrabold rounded-lg transition ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All Issues' : `${cat} IPOs`}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search company, sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-[#0a1128] border border-blue-900/50 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 placeholder:text-slate-500"
          />

          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value as any)}
            className="bg-[#0a1128] border border-blue-900/50 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Current">Active Now</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Sync Status Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">Live Auto-Sync Active (Next 14 Days)</span>
        </div>
        {isValidating && <span className="text-blue-400 animate-pulse text-[11px]">Updating from database...</span>}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIpos.map((ipo) => (
          <div
            key={ipo.id}
            className="bg-white rounded-2xl border-4 border-[#14234d] shadow-xl overflow-hidden flex flex-col justify-between text-slate-800"
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl bg-slate-50 font-black text-blue-950 text-xs shadow-inner">
                  {ipo.company_name.split(' ')[0]}
                </div>
                <div className="flex-1 text-right">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 mb-1">
                    {ipo.category}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {ipo.company_name}
                  </h3>
                </div>
              </div>

              {/* Open / Close Pill Banners */}
              <div className="grid grid-cols-2 gap-2 text-white font-bold text-center text-xs">
                <div className="bg-[#10b981] py-1.5 px-2 rounded-xl shadow-sm">
                  <span className="block text-[9px] uppercase tracking-wider opacity-90">OPEN ON</span>
                  <span>{ipo.open_date}</span>
                </div>
                <div className="bg-[#ef4444] py-1.5 px-2 rounded-xl shadow-sm">
                  <span className="block text-[9px] uppercase tracking-wider opacity-90">CLOSE ON</span>
                  <span>{ipo.close_date}</span>
                </div>
              </div>

              {/* Offer Price Row */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-4xl font-extrabold text-[#14234d]">₹</span>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Offer Price</div>
                  <div className="text-lg font-black text-slate-900">
                    {ipo.offer_price_range}{' '}
                    <span className="text-xs font-semibold text-slate-500">[{ipo.lot_size}x1 Lot]</span>
                  </div>
                </div>
              </div>

              {/* 10-Star Rating Bar */}
              <div className="bg-[#14234d] text-white p-2 rounded-xl text-center shadow-inner">
                <div className="text-[11px] font-bold text-slate-200 mb-0.5">Rating [{ipo.rating_stars}/10]</div>
                <div className="flex justify-center gap-0.5 text-yellow-400 text-base">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i}>{i < ipo.rating_stars ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>

              {/* GMP Banner */}
              <div className="text-center py-2.5 font-black text-emerald-600 text-sm border-y border-slate-100 bg-emerald-50 rounded-xl">
                GMP: {ipo.gmp_range} ({ipo.gmp_percent})
              </div>

              {/* Description preview */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="font-extrabold text-slate-900 text-xs">Description :</div>
                <p className="text-slate-600 leading-relaxed text-[11.5px] line-clamp-3">
                  {ipo.description}
                </p>
                <div className="pt-2 font-semibold text-slate-800 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-500 font-medium">Allotment:</span>
                    <span className="font-bold">{ipo.allotment_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-500 font-medium">Refund:</span>
                    <span className="font-bold">{ipo.refund_date}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500 font-medium">Listing:</span>
                    <span className="font-bold">{ipo.listing_date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 space-y-2">
              <a
                href="https://angel-one.onelink.me"
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-[#14234d] hover:bg-slate-950 text-white font-extrabold py-2.5 rounded-xl transition text-xs shadow-md"
              >
                Apply Now
              </a>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIpo(ipo)}
                  className="bg-[#14234d] hover:bg-slate-950 text-white text-[11px] font-bold py-2 rounded-xl transition shadow-sm"
                >
                  More Info.
                </button>
                <button
                  type="button"
                  onClick={() => setSubscriptionIpo(ipo)}
                  className="bg-[#14234d] hover:bg-slate-950 text-white text-[11px] font-bold py-2 rounded-xl transition shadow-sm"
                >
                  Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setAllotmentIpo(ipo)}
                  className="bg-[#14234d] hover:bg-slate-950 text-white text-[11px] font-bold py-2 rounded-xl transition shadow-sm"
                >
                  Allotment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIpos.length === 0 && (
        <div className="text-center py-20 bg-[#101b42]/40 rounded-3xl border border-dashed border-blue-900/50 mt-6">
          <p className="text-sm font-semibold text-slate-400">No IPOs found scheduled for the next 14 days.</p>
        </div>
      )}

      {/* 1. Live Subscription Modal */}
      {subscriptionIpo && (
        <SubscriptionModal
          ipo={subscriptionIpo}
          onClose={() => setSubscriptionIpo(null)}
        />
      )}

      {/* 2. KFintech Allotment Status Modal */}
      {allotmentIpo && (
        <AllotmentModal
          ipo={allotmentIpo}
          allIpos={currentList}
          onClose={() => setAllotmentIpo(null)}
        />
      )}

      {/* 3. In-App More Info Modal */}
      {selectedIpo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto text-slate-800 p-6 shadow-2xl relative border-4 border-[#14234d]">
            <button
              onClick={() => setSelectedIpo(null)}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 mb-1">
                  {selectedIpo.category} Issue
                </span>
                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {selectedIpo.company_name}
                </h2>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Current Premium (GMP)</div>
                  <div className="text-base font-black text-emerald-900">{selectedIpo.gmp_range}</div>
                </div>
                <div className="text-lg font-black text-emerald-600">{selectedIpo.gmp_percent}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  About the Company & Issue
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs leading-relaxed text-slate-700">
                  {selectedIpo.description}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Issue Timetable & Details
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Price Band:</span>
                    <span className="font-bold text-slate-900">₹{selectedIpo.offer_price_range}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Lot Size:</span>
                    <span className="font-bold text-slate-900">{selectedIpo.lot_size} Shares</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Bidding Opens:</span>
                    <span className="font-bold text-emerald-600">{selectedIpo.open_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Bidding Closes:</span>
                    <span className="font-bold text-rose-600">{selectedIpo.close_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Allotment Finalized:</span>
                    <span className="font-bold text-slate-900">{selectedIpo.allotment_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Refunds Initiated:</span>
                    <span className="font-bold text-slate-900">{selectedIpo.refund_date}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500">Listing On Exchanges:</span>
                    <span className="font-bold text-blue-700">{selectedIpo.listing_date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://angel-one.onelink.me"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-[#14234d] hover:bg-slate-950 text-white font-black py-3 rounded-2xl transition text-xs shadow-md"
                >
                  Apply Now via Broker
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}