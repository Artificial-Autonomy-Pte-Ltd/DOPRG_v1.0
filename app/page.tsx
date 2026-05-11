'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StockChart } from '@/components/stock-chart';
import { OptionPricer } from '@/components/option-pricer';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';

interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OptionsData {
  expirationDates: string[];
  strikes: number[];
  calls: unknown[];
  puts: unknown[];
}

interface StockData {
  quote: StockQuote;
  historical: HistoricalData[];
  options: OptionsData | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [searchTicker, setSearchTicker] = useState('');

  const { data, error, isLoading } = useSWR<StockData>(
    searchTicker ? `/api/stock?symbol=${searchTicker}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleSearch = () => {
    if (ticker.trim()) {
      setSearchTicker(ticker.trim().toUpperCase());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const expirationDates = data?.options?.expirationDates?.map(
    (d) => new Date(d)
  ) || [];
  const strikes = data?.options?.strikes || [];

  const isPositive = data?.quote?.regularMarketChange >= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-[#161A1E]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => {
                setTicker('');
                setSearchTicker('');
              }}
              className="text-left group"
            >
              <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors cursor-pointer">
                <Activity className="h-5 w-5 text-primary" />
                Derivatives - Options
              </h1>
              <p className="text-xs text-muted-foreground">
                Price + Risk-Greeks
              </p>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <Input
                type="text"
                placeholder="Search symbol..."
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="w-[140px] sm:w-[180px] bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono"
              />
              <Button 
                onClick={handleSearch} 
                disabled={!ticker.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
              </Button>
              <div className="hidden sm:block h-6 w-px bg-border" />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {!searchTicker && (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-4 p-4 rounded-full bg-primary/10">
              <Activity className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Enter a Symbol to Begin
            </h2>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Search for a stock symbol to view price history, option chains, and
              calculate option prices using the Black-Scholes model.
            </p>
            <div className="flex flex-col items-center gap-2">
              {/* Row 1: Futures */}
              <div className="flex flex-wrap justify-center gap-2">
                {['MNQ=F', 'MES=F'].map((sym) => (
                  <Button
                    key={sym}
                    variant="outline"
                    size="sm"
                    className="border-border bg-card hover:bg-secondary hover:text-primary font-mono"
                    onClick={() => {
                      setTicker(sym);
                      setSearchTicker(sym);
                    }}
                  >
                    {sym}
                  </Button>
                ))}
              </div>
              {/* Row 2: ETFs */}
              <div className="flex flex-wrap justify-center gap-2">
                {['QQQ', 'SPY'].map((sym) => (
                  <Button
                    key={sym}
                    variant="outline"
                    size="sm"
                    className="border-border bg-card hover:bg-secondary hover:text-primary font-mono"
                    onClick={() => {
                      setTicker(sym);
                      setSearchTicker(sym);
                    }}
                  >
                    {sym}
                  </Button>
                ))}
              </div>
              {/* Row 3: Big Tech */}
              <div className="flex flex-wrap justify-center gap-2">
                {['MSFT', 'GOOGL', 'GOOG', 'AAPL', 'AMZN', 'META'].map((sym) => (
                  <Button
                    key={sym}
                    variant="outline"
                    size="sm"
                    className="border-border bg-card hover:bg-secondary hover:text-primary font-mono"
                    onClick={() => {
                      setTicker(sym);
                      setSearchTicker(sym);
                    }}
                  >
                    {sym}
                  </Button>
                ))}
              </div>
              {/* Row 4: Tesla & Crypto */}
              <div className="flex flex-wrap justify-center gap-2">
                {['TSLA', 'ANTHROPIC-USD'].map((sym) => (
                  <Button
                    key={sym}
                    variant="outline"
                    size="sm"
                    className="border-border bg-card hover:bg-secondary hover:text-primary font-mono"
                    onClick={() => {
                      setTicker(sym);
                      setSearchTicker(sym);
                    }}
                  >
                    {sym}
                  </Button>
                ))}
              </div>
              {/* Row 5: AI/Quantum */}
              <div className="flex flex-wrap justify-center gap-2">
                {['NVDA', 'QBTS', 'RGTI', 'IONQ'].map((sym) => (
                  <Button
                    key={sym}
                    variant="outline"
                    size="sm"
                    className="border-border bg-card hover:bg-secondary hover:text-primary font-mono"
                    onClick={() => {
                      setTicker(sym);
                      setSearchTicker(sym);
                    }}
                  >
                    {sym}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-8 w-48 bg-secondary" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full bg-secondary" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Skeleton className="h-[300px] w-full bg-secondary" />
              </CardContent>
            </Card>
          </div>
        )}

        {(error || (data && !data.quote)) && (
          <Alert variant="destructive" className="bg-[#F6465D]/10 border-[#F6465D]/30">
            <AlertDescription className="text-[#F6465D]">
              Failed to fetch data. Please check the symbol and try again.
            </AlertDescription>
          </Alert>
        )}

        {data && data.quote && !isLoading && (
          <div className="space-y-4">
            {/* Stock Quote Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-foreground font-mono">{data.quote.symbol}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {data.quote.shortName}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${
                    isPositive ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPositive ? '+' : ''}
                    {data.quote.regularMarketChangePercent?.toFixed(2)}%
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                    <p className="text-2xl font-bold text-foreground font-mono">
                      ${data.quote.regularMarketPrice?.toFixed(2)}
                    </p>
                    <p className={`text-sm font-mono ${isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {isPositive ? '+' : ''}${data.quote.regularMarketChange?.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Volume</p>
                    <p className="text-2xl font-bold text-foreground font-mono">
                      {(data.quote.regularMarketVolume / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">52W High</p>
                    <p className="text-2xl font-bold text-[#0ECB81] font-mono">
                      ${data.quote.fiftyTwoWeekHigh?.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">52W Low</p>
                    <p className="text-2xl font-bold text-[#F6465D] font-mono">
                      ${data.quote.fiftyTwoWeekLow?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Price History (1Y)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.historical && data.historical.length > 0 ? (
                  <StockChart data={data.historical} symbol={data.quote.symbol} />
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    No historical data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Options Info */}
            {!data.options && (
              <Alert className="bg-primary/10 border-primary/30">
                <AlertDescription className="text-muted-foreground">
                  Options data not available for this symbol. Using manual parameter input.
                </AlertDescription>
              </Alert>
            )}

            {/* Option Pricer */}
            <OptionPricer
              currentPrice={data.quote.regularMarketPrice}
              symbol={data.quote.symbol}
              expirationDates={expirationDates}
              strikes={strikes}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-[#161A1E] py-4 text-center text-xs text-muted-foreground">
        <p>
          Option prices calculated using Black-Scholes model. Market data via Yahoo Finance.
        </p>
      </footer>
    </div>
  );
}
