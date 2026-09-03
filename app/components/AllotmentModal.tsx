'use client';

import { useState } from 'react';
import { IPO } from '../page';

interface AllotmentModalProps {
  ipo: IPO;
  allIpos: IPO[];
  onClose: () => void;
}

export default function AllotmentModal({ ipo, allIpos, onClose }: AllotmentModalProps) {
  const [selectedIpoName, setSelectedIpoName] = useState(ipo.company_name);
  const [searchMethod, setSearchMethod] = useState<'Application No' | 'Demat Account' | 'PAN'>('PAN');
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1633] text-slate-800 flex justify-center overflow-y-auto">
      <div className="w-full max-w-md min-h-screen bg-[#f1f4f9] flex flex-col shadow-2xl relative">
        
        {/* Top Header Bar */}
        <div className="bg-[#182952] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/10 rounded-full transition text-lg"
          >
            ←
          </button>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 font-bold text-sm hover:text-slate-200 transition"
          >
            <span>Refresh</span>
            <span className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
          </button>
          <div className="w-6"></div>
        </div>

        {/* KFintech Header Logo Section */}
        <div className="bg-white py-4 px-6 border-b border-slate-200 flex justify-center items-center shadow-sm">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none">
              <path d="M10 80 L50 20 L70 50 L50 80 Z" fill="#00a3e0" />
              <path d="M50 20 L90 80 L65 80 L40 40 Z" fill="#1b365d" />
            </svg>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#1b365d] leading-none">
                KFINTECH
              </span>
              <span className="text-[7px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                EXPERIENCE TRANSFORMATION
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-6">
          {/* Allotment Query Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/80 mt-2">
            <h2 className="text-center text-xl font-extrabold text-[#006699] mb-6">
              IPO Allotment Status
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select IPO Dropdown */}
              <div className="relative">
                <select
                  value={selectedIpoName}
                  onChange={(e) => setSelectedIpoName(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3.5 py-3 outline-none focus:border-[#0088cc] appearance-none pr-9 font-medium"
                >
                  <option value={ipo.company_name}>{ipo.company_name}</option>
                  {allIpos
                    .filter((item) => item.company_name !== ipo.company_name)
                    .map((item) => (
                      <option key={item.id} value={item.company_name}>
                        {item.company_name}
                      </option>
                    ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>

              {/* Radio Search Options */}
              <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-800 px-1 pt-1">
                {(['Application No', 'Demat Account', 'PAN'] as const).map((method) => (
                  <label key={method} className="flex items-center gap-1.5 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="allotment_method"
                      checked={searchMethod === method}
                      onChange={() => setSearchMethod(method)}
                      className="accent-[#0088cc] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>

              {/* Input Field */}
              <div>
                <input
                  type="text"
                  required
                  placeholder={`Enter ${searchMethod === 'PAN' ? 'PAN no' : searchMethod}`}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setSubmitted(false);
                  }}
                  className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm rounded-lg px-3.5 py-3 outline-none focus:border-[#0088cc] uppercase font-semibold"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1 flex justify-center">
                <button
                  type="submit"
                  className="bg-[#2995dc] hover:bg-[#1f80c0] text-white font-bold px-8 py-2.5 rounded-lg text-sm transition shadow-md"
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Simulated Live Registrar Result */}
            {submitted && (
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 animate-fadeIn">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Issue:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedIpoName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{searchMethod}:</span>
                  <span className="font-bold text-slate-800">{inputValue.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-extrabold text-amber-600">
                    Allotment in Process (Scheduled for {ipo.allotment_date})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Official Blue Footer Section */}
          <div className="bg-[#1b509d] text-white p-5 rounded-t-2xl space-y-4">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 100 100" className="w-6 h-6 fill-none">
                <path d="M10 80 L50 20 L70 50 L50 80 Z" fill="#ffffff" />
                <path d="M50 20 L90 80 L65 80 L40 40 Z" fill="#8ed8f8" />
              </svg>
              <span className="text-base font-black tracking-tight text-white">
                KFINTECH
              </span>
            </div>

            <p className="text-[11.5px] leading-relaxed text-blue-100 font-medium">
              A pioneer in the financial sector KFintech&apos;s corporate registry services have made a mark in the market for their innovative and technology oriented service offerings.
            </p>

            <div className="pt-1">
              <span className="text-xs font-black tracking-wider text-white uppercase cursor-pointer hover:underline">
                ABOUT US
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}