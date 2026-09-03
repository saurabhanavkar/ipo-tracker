'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { IPO } from '../page';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function IPOClientView({ initialIpos }: { initialIpos: IPO[] }) {
  // Live polling every 5000ms (5 seconds) with immediate tab-focus synchronization
  const { data: ipos, isValidating } = useSWR<IPO[]>('/api/ipos', fetcher, {
    fallbackData: initialIpos,
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const [activeTab, setActiveTab] = useState<'All' | 'Mainline' | 'SME'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Current' | 'Upcoming' | 'Closed'>('All');
  const [search, setSearch] = useState('');

  const currentList = ipos || initialIpos;

  const filteredIpos = useMemo(() => {
    return currentList.filter((item) => {
      const matchCategory = activeTab === 'All' || item.category === activeTab;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchSearch =
        item.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [currentList, activeTab, statusFilter, search]);

  return (
    <div>
      {/* Live Sync Status Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">Live Auto-Sync Active</span>
        </div>
        {isValidating && <span className="text-[11px] text-blue-400 animate-pulse">Checking for updates...</span>}
      </div>

      {/* Controls: Search & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#13234d] border border-blue-900/40 p-3 rounded-2xl mb-6 shadow-md">
        {/* Mainline / SME Tabs */}
        <div className="flex bg-[#0b1329] p-1 rounded-xl w-full md:w-auto border border-blue-900/50">
          {(['All', 'Mainline', 'SME'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-5 py-2 text-xs md:text-sm font-extrabold rounded-lg transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'All' ? 'All IPOs' : tab}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search company or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 bg-[#0b1329] border border-blue-900/50 text-white placeholder-slate-500 text-xs md:text-sm rounded-xl px-3.5 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#0b1329] border border-blue-900/50 text-white text-xs md:text-sm rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Current">Current</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredIpos.length === 0 && (
        <div className="text-center py-20 bg-[#13234d]/40 rounded-3xl border border-dashed border-blue-900/50">
          <p className="text-base text-slate-400 font-medium">No IPOs found matching your filters.</p>
        </div>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIpos.map((ipo) => (
          <div
            key={ipo.id}
            className="bg-white rounded-2xl border-4 border-[#152544] shadow-xl overflow-hidden flex flex-col justify-between text-slate-800 hover:-translate-y-1 transition duration-200"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-12 flex items-center justify-center border border-slate-200 rounded-xl p-1 bg-slate-50 shadow-inner">
                  <span className="text-xs font-black tracking-tight text-[#1e3a6d]">
                    {ipo.company_name?.split(' ')[0] || 'IPO'}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 mb-1">
                    {ipo.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {ipo.company_name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-white font-bold text-center text-xs">
                <div className="bg-[#10b981] py-1.5 px-2 rounded-xl shadow-sm">
                  <span className="block text-[9px] uppercase tracking-wider opacity-90">OPEN ON</span>
                  <span className="text-xs font-black">{ipo.open_date}</span>
                </div>
                <div className="bg-[#ef4444] py-1.5 px-2 rounded-xl shadow-sm">
                  <span className="block text-[9px] uppercase tracking-wider opacity-90">CLOSE ON</span>
                  <span className="text-xs font-black">{ipo.close_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-4xl font-extrabold text-[#152544]">₹</span>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Offer Price</div>
                  <div className="text-lg font-black text-slate-900">
                    {ipo.offer_price_range}{' '}
                    <span className="text-xs font-normal text-slate-500">[{ipo.lot_size}x1 Lot]</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#182a4d] text-white p-2 rounded-xl text-center shadow-inner">
                <div className="text-[11px] font-semibold text-slate-200 mb-0.5">
                  Rating [{ipo.rating_stars}/10]
                </div>
                <div className="flex justify-center gap-0.5 text-yellow-400 text-base">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i}>{i < ipo.rating_stars ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="bg-[#1e3a6d] text-white font-bold py-2 rounded-xl text-xs hover:opacity-95 transition">
                  Review*
                </button>
                <div
                  className={`flex items-center justify-center font-extrabold py-2 rounded-xl text-xs border-2 ${
                    ipo.sentiment === 'Neutral'
                      ? 'border-slate-300 text-slate-600 bg-slate-100'
                      : 'border-[#1e3a6d] text-[#1e3a6d] bg-white'
                  }`}
                >
                  {ipo.sentiment}
                </div>
              </div>

              <div className="text-center py-2.5 font-black text-emerald-600 text-sm border-y border-slate-100 bg-emerald-50 rounded-xl">
                GMP: {ipo.gmp_range} ({ipo.gmp_percent})
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <p className="line-clamp-2 leading-relaxed text-slate-600 text-[11px]">
                  {ipo.description}
                </p>

                <div className="space-y-1 font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allotment:</span>
                    <span className="font-bold">{ipo.allotment_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Refund:</span>
                    <span className="font-bold">{ipo.refund_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Listing:</span>
                    <span className="font-bold">{ipo.listing_date}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <a
                href="https://angel-one.onelink.me"
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-[#152544] hover:bg-slate-900 text-white font-extrabold py-2.5 rounded-xl transition text-xs shadow-md"
              >
                Apply Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}