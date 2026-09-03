import { sql } from '@/lib/db';
import IPOClientView from './components/IPOClientView';

// Tells Next.js to dynamically fetch data on request / revalidate every 60 seconds
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export interface IPO {
  id: number;
  company_name: string;
  logo_url: string;
  open_date: string;
  close_date: string;
  offer_price_range: string;
  lot_size: number;
  rating_stars: number;
  sentiment: string;
  gmp_range: string;
  gmp_percent: string;
  description: string;
  allotment_date: string;
  refund_date: string;
  listing_date: string;
  category: 'Mainline' | 'SME';
  status: 'Current' | 'Upcoming' | 'Closed';
}

export default async function HomePage() {
  let ipos: IPO[] = [];
  try {
    const result = await sql`
      SELECT * FROM ipos ORDER BY id DESC;
    `;
    ipos = result as IPO[];
  } catch (err) {
    console.error('Failed to query DB:', err);
  }

  return (
    <main className="min-h-screen bg-[#0b1329] text-slate-100 antialiased selection:bg-blue-600 selection:text-white pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f1d3e]/85 border-b border-blue-900/40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
              ₹
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                IPO Tracker <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Live GMP</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Real-time Indian IPO Grey Market Premium & Allotment Watch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 text-xs md:text-sm font-bold px-3.5 py-2 rounded-xl transition"
            >
              <span>Join WhatsApp Alert</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-[#13234d] border border-blue-900/40 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400">Total Tracked</div>
            <div className="text-2xl font-black text-white mt-1">{ipos.length}</div>
          </div>
          <div className="bg-[#13234d] border border-blue-900/40 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400">Active / Current</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {ipos.filter(i => i.status === 'Current').length}
            </div>
          </div>
          <div className="bg-[#13234d] border border-blue-900/40 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400">Upcoming</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {ipos.filter(i => i.status === 'Upcoming').length}
            </div>
          </div>
          <div className="bg-[#13234d] border border-blue-900/40 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400">Avg Est. GMP Gain</div>
            <div className="text-2xl font-black text-amber-400 mt-1">+29.6%</div>
          </div>
        </div>

        {/* Dynamic Filtering Client Component */}
        <IPOClientView initialIpos={ipos} />
      </div>
    </main>
  );
}