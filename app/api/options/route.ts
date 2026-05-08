import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const expiration = searchParams.get('expiration');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const options = await yahooFinance.options(symbol, {
      date: expiration ? new Date(expiration) : undefined,
    });

    return NextResponse.json({
      expirationDates: options.expirationDates,
      strikes: options.strikes,
      calls: options.options[0]?.calls || [],
      puts: options.options[0]?.puts || [],
      underlyingPrice: options.underlyingSymbol,
    });
  } catch (error) {
    console.error('Error fetching options data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options data' },
      { status: 500 }
    );
  }
}
