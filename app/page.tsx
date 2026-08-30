import { sql } from '@/lib/db';

export const revalidate = 60; // Auto-refreshes data every 60s

export default async function HomePage() {
  const ipos = await sql`
    SELECT * FROM ipos ORDER BY id DESC;
  `;

  return (
    <main className="min-h-screen bg-slate-900 py-6 px-3 flex justify-center">
      <div className="w-full max-w-md space-y-4">
        
        {/* Top Header Toggle (IPO vs Market) */}
        <div className="bg-[#1b2b4e] p-1.5 rounded-full flex border border-blue-900/50 shadow-inner">
          <button className="flex-1 bg-white text-[#152544] font-extrabold text-xl py-2 rounded-full shadow-md text-center">
            IPO
          </button>
          <button className="flex-1 text-white font-extrabold text-xl py-2 text-center">
            Market
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button className="bg-white text-[#152544] font-bold py-2 rounded-xl text-sm border-2 border-[#1e3a6d] shadow-sm">
            Mainline
          </button>
          <button className="bg-[#152544] text-white font-bold py-2 rounded-xl text-sm border border-blue-900">
            SME
          </button>
          <button className="bg-[#152544] text-white font-bold py-2 rounded-xl text-sm border border-blue-900">
            IPO Tools
          </button>
        </div>

        {/* Dropdown Filters & Join Group */}
        <div className="flex gap-2">
          <select className="flex-1 bg-[#152544] text-white font-semibold text-sm px-4 py-2 rounded-xl border border-blue-800 outline-none">
            <option>Current IPO</option>
            <option>Upcoming IPO</option>
            <option>Closed IPO</option>
          </select>
          <a
            href="https://chat.whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-[#152544] text-white font-bold text-xs px-3 py-2 rounded-xl border border-blue-800"
          >
            <span>Join Group</span>
            <span className="text-emerald-400 text-base">🟢</span>
          </a>
        </div>

        {/* IPO Cards List */}
        <div className="space-y-6">
          {ipos.map((ipo: any) => (
            <div
              key={ipo.id}
              className="bg-white rounded-2xl border-4 border-[#152544] shadow-xl overflow-hidden text-slate-800"
            >
              <div className="p-4 space-y-3">
                {/* Logo & Header Timeline */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-16 h-12 flex items-center justify-center border border-slate-100 rounded-lg p-1 bg-white">
                    <span className="text-xs font-black tracking-tighter text-[#1e3a6d]">
                      {ipo.company_name.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-slate-800 leading-tight text-right">
                      {ipo.company_name}
                    </h2>
                  </div>
                </div>

                {/* Open / Close Badges */}
                <div className="grid grid-cols-2 gap-2 text-white font-bold text-center text-xs">
                  <div className="bg-[#10b981] py-1.5 px-2 rounded-xl shadow-sm">
                    <span className="block text-[10px] opacity-90 uppercase tracking-wide">OPEN ON</span>
                    <span className="text-sm">{ipo.open_date}</span>
                  </div>
                  <div className="bg-[#ef4444] py-1.5 px-2 rounded-xl shadow-sm">
                    <span className="block text-[10px] opacity-90 uppercase tracking-wide">CLOSE ON</span>
                    <span className="text-sm">{ipo.close_date}</span>
                  </div>
                </div>

                {/* Offer Price Row */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-4xl font-extrabold text-[#152544]">₹</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Offer Price</div>
                    <div className="text-lg font-black text-slate-800">
                      {ipo.offer_price_range} <span className="text-xs font-normal text-slate-600">[{ipo.lot_size}x1 Lot]</span>
                    </div>
                  </div>
                </div>

                {/* Rating Banner */}
                <div className="bg-[#182a4d] text-white p-2 rounded-xl text-center shadow-inner">
                  <div className="text-xs font-semibold mb-1 text-slate-200">
                    Rating [{ipo.rating_stars}/10]
                  </div>
                  <div className="flex justify-center gap-1 text-yellow-400 text-lg">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i}>{i < ipo.rating_stars ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons (Review / Apply) */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-[#1e3a6d] text-white font-bold py-2 rounded-xl text-sm hover:opacity-90 transition">
                    Review*
                  </button>
                  <button
                    className={`font-bold py-2 rounded-xl text-sm border-2 transition ${
                      ipo.sentiment === 'Neutral'
                        ? 'border-slate-400 text-slate-700 bg-slate-50'
                        : 'border-[#1e3a6d] text-[#1e3a6d] bg-white'
                    }`}
                  >
                    {ipo.sentiment}
                  </button>
                </div>

                {/* GMP Callout */}
                <div className="text-center py-2 font-black text-emerald-600 text-base border-y border-slate-100 bg-emerald-50/50 rounded-lg">
                  GMP: {ipo.gmp_range} ({ipo.gmp_percent})
                </div>

                {/* Description & Timeline */}
                <div className="space-y-3 text-xs text-slate-700 pt-1">
                  <div>
                    <strong className="text-slate-900 block mb-1">Description :</strong>
                    <p className="leading-relaxed text-slate-600">{ipo.description}</p>
                  </div>

                  <div className="space-y-1 font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div><strong>Allotment:</strong> {ipo.allotment_date}</div>
                    <div><strong>Refund:</strong> {ipo.refund_date}</div>
                    <div><strong>Listing:</strong> {ipo.listing_date}</div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 italic">
                  All Info. Education Purpose Only.
                </div>

                {/* Apply Now Primary CTA */}
                <a
                  href="https://angel-one.onelink.me"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-[#152544] text-white font-black py-3 rounded-xl hover:bg-slate-800 transition tracking-wide text-sm shadow-md"
                >
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
