import { sql } from '@/lib/db';
import IPOClientView from './components/IPOClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export interface IPO {
  id: number;
  company_name: string;
  logo_url?: string;
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
    const result = await sql`SELECT * FROM ipos ORDER BY id DESC;`;
    ipos = result as IPO[];
  } catch (err) {
    console.error('Failed to query DB:', err);
  }

  return (
    <main className="min-h-screen bg-[#0a1128] text-slate-100 font-sans antialiased pb-20 selection:bg-blue-600 selection:text-white">
      <header className="border-b border-blue-900/40 bg-[#0d163a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md shadow-blue-600/30 text-lg">
              ₹
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                IPO Terminal
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                Real-Time Issue & GMP Watch
              </span>
            </div>
          </div>
          <a
            href="https://chat.whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            WhatsApp Alerts
          </a>
        </div>
      </header>

      <IPOClientView initialIpos={ipos} />
    </main>
  );
}