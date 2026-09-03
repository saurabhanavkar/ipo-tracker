import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const result = await sql`
      SELECT * FROM ipo_subscriptions 
      WHERE symbol = ${symbol} OR company_name ILIKE ${'%' + symbol + '%'}
      LIMIT 1;
    `;

    if (result.length === 0) {
      // Fallback default structure
      return NextResponse.json({
        symbol: symbol,
        updated_at: 'Live',
        total_subscription: '24.50x',
        total_bids_cr: '4,820.50',
        retail_times: '8.40x',
        allotment_chance: 8,
        retail_apps: '845,120 · 12.10x',
        categories: [
          { title: 'QIB', sub: 'QUALIFIED INSTITUTIONAL', times: '28.10x', amount: '₹2,100 Cr', qty: '82,400,000' },
          { title: 'HNI', sub: 'NON-INSTITUTIONAL', times: '45.20x', amount: '₹1,850 Cr', qty: '65,200,000' },
          { title: 'RETAIL', sub: 'RETAIL INDIVIDUAL', times: '8.40x', amount: '₹870 Cr', qty: '31,500,000' }
        ]
      });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}