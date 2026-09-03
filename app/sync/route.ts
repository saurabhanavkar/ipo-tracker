import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Can trigger GitHub Actions dispatch or an external webhook
  try {
    const res = await fetch(
      'https://api.github.com/repos/saurabhanavkar/ipo-tracker/actions/workflows/scraper.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Live scrape triggered' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}