'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GreeksChart } from './greeks-chart';
import {
  optionPrice,
  delta,
  gamma,
  vega,
  theta,
  rho,
  vanna,
  volga,
  generateGreeksData,
} from '@/lib/black-scholes';
import { format, differenceInDays } from 'date-fns';

interface OptionPricerProps {
  currentPrice: number;
  symbol: string;
  expirationDates?: Date[];
  strikes?: number[];
}

export function OptionPricer({
  currentPrice,
  symbol,
  expirationDates = [],
  strikes = [],
}: OptionPricerProps) {
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [strikePrice, setStrikePrice] = useState(currentPrice);
  const [volatility, setVolatility] = useState(30);
  const [riskFreeRate, setRiskFreeRate] = useState(5);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [daysToExpiry, setDaysToExpiry] = useState(30);

  useEffect(() => {
    if (currentPrice > 0) {
      if (strikes.length > 0) {
        const closestStrike = strikes.reduce((prev, curr) =>
          Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
        );
        setStrikePrice(closestStrike);
      } else {
        setStrikePrice(Math.round(currentPrice));
      }
    }
  }, [currentPrice, strikes]);

  useEffect(() => {
    if (expirationDates.length > 0 && !selectedExpiry) {
      const firstExpiry = expirationDates[0];
      setSelectedExpiry(firstExpiry.toISOString());
      setDaysToExpiry(Math.max(1, differenceInDays(firstExpiry, new Date())));
    }
  }, [expirationDates, selectedExpiry]);

  useEffect(() => {
    if (selectedExpiry) {
      const expDate = new Date(selectedExpiry);
      const days = Math.max(1, differenceInDays(expDate, new Date()));
      setDaysToExpiry(days);
    }
  }, [selectedExpiry]);

  const timeToExpiry = daysToExpiry / 365;
  const vol = volatility / 100;
  const rate = riskFreeRate / 100;

  const calculations = useMemo(() => {
    if (currentPrice <= 0 || strikePrice <= 0) {
      return null;
    }

    return {
      price: optionPrice(currentPrice, strikePrice, timeToExpiry, rate, vol, optionType),
      delta: delta(currentPrice, strikePrice, timeToExpiry, rate, vol, optionType),
      gamma: gamma(currentPrice, strikePrice, timeToExpiry, rate, vol),
      vega: vega(currentPrice, strikePrice, timeToExpiry, rate, vol),
      theta: theta(currentPrice, strikePrice, timeToExpiry, rate, vol, optionType),
      rho: rho(currentPrice, strikePrice, timeToExpiry, rate, vol, optionType),
      vanna: vanna(currentPrice, strikePrice, timeToExpiry, rate, vol),
      volga: volga(currentPrice, strikePrice, timeToExpiry, rate, vol),
    };
  }, [currentPrice, strikePrice, timeToExpiry, rate, vol, optionType]);

  const chartData = useMemo(() => {
    if (currentPrice <= 0 || strikePrice <= 0) {
      return [];
    }
    return generateGreeksData(
      currentPrice,
      strikePrice,
      timeToExpiry,
      rate,
      vol,
      optionType,
      0.4
    );
  }, [currentPrice, strikePrice, timeToExpiry, rate, vol, optionType]);

  const greekColors = {
    price: '#00D4FF',
    delta: '#0ECB81',
    gamma: '#1E88E5',
    vega: '#7B61FF',
    theta: '#F6465D',
    rho: '#00BCD4',
    vanna: '#FF9800',
    volga: '#E91E63',
  };

  return (
    <div className="space-y-4">
      {/* Option Parameters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Option Parameters</span>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs font-mono ${
                optionType === 'call' 
                  ? 'bg-[#0ECB81]/10 text-[#0ECB81]' 
                  : 'bg-[#F6465D]/10 text-[#F6465D]'
              }`}>
                {symbol} {optionType.toUpperCase()}
              </span>
              <span className="px-2 py-1 rounded text-xs font-mono bg-primary/10 text-primary">
                ${strikePrice} Strike
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Option Type */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={optionType}
                onValueChange={(v) => setOptionType(v as 'call' | 'put')}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="call" className="text-[#0ECB81]">Call Option</SelectItem>
                  <SelectItem value="put" className="text-[#F6465D]">Put Option</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Strike Price */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Strike ($)</Label>
              {strikes.length > 0 ? (
                <Select
                  value={strikePrice.toString()}
                  onValueChange={(v) => setStrikePrice(Number(v))}
                >
                  <SelectTrigger className="bg-secondary border-border text-foreground font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] bg-card border-border">
                    {strikes.map((strike) => (
                      <SelectItem key={strike} value={strike.toString()} className="font-mono">
                        ${strike.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(Number(e.target.value))}
                  min={0}
                  step={1}
                  className="bg-secondary border-border text-foreground font-mono"
                />
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Expiration</Label>
              {expirationDates.length > 0 ? (
                <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] bg-card border-border">
                    {expirationDates.map((date) => (
                      <SelectItem key={date.toISOString()} value={date.toISOString()}>
                        {format(date, 'MMM dd, yyyy')} ({Math.max(1, differenceInDays(date, new Date()))}d)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={daysToExpiry}
                  onChange={(e) => setDaysToExpiry(Number(e.target.value))}
                  min={1}
                  placeholder="Days"
                  className="bg-secondary border-border text-foreground font-mono"
                />
              )}
            </div>

            {/* Current Price Display */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Spot Price</Label>
              <div className="flex h-9 items-center rounded-md border border-border bg-secondary px-3 text-sm font-mono text-foreground">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Volatility and Rate Sliders */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Implied Volatility</Label>
                <span className="text-sm font-mono text-primary">{volatility}%</span>
              </div>
              <Slider
                value={[volatility]}
                onValueChange={([v]) => setVolatility(v)}
                min={5}
                max={150}
                step={1}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Risk-Free Rate</Label>
                <span className="text-sm font-mono text-primary">{riskFreeRate}%</span>
              </div>
              <Slider
                value={[riskFreeRate]}
                onValueChange={([v]) => setRiskFreeRate(v)}
                min={0}
                max={15}
                step={0.1}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Values */}
      {calculations && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Black-Scholes Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-lg bg-primary/10 p-3 text-center border border-primary/20">
                <p className="text-xs text-muted-foreground">Option Price</p>
                <p className="text-xl font-bold text-primary font-mono">
                  ${calculations.price.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Delta</p>
                <p className="text-xl font-bold text-[#0ECB81] font-mono">{calculations.delta.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Gamma</p>
                <p className="text-xl font-bold text-[#1E88E5] font-mono">{calculations.gamma.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Vega</p>
                <p className="text-xl font-bold text-[#7B61FF] font-mono">{calculations.vega.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Theta (daily)</p>
                <p className="text-xl font-bold text-[#F6465D] font-mono">
                  {calculations.theta.toFixed(4)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Rho</p>
                <p className="text-xl font-bold text-[#00BCD4] font-mono">{calculations.rho.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Vanna</p>
                <p className="text-xl font-bold text-[#FF9800] font-mono">{calculations.vanna.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Volga</p>
                <p className="text-xl font-bold text-[#E91E63] font-mono">{calculations.volga.toFixed(4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Greeks Charts */}
      {chartData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Profiles vs Underlying</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 flex flex-wrap h-auto gap-1 bg-secondary/50 p-1">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Greeks</TabsTrigger>
                <TabsTrigger value="price" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Price</TabsTrigger>
                <TabsTrigger value="delta" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Delta</TabsTrigger>
                <TabsTrigger value="gamma" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Gamma</TabsTrigger>
                <TabsTrigger value="vega" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vega</TabsTrigger>
                <TabsTrigger value="theta" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Theta</TabsTrigger>
                <TabsTrigger value="rho" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Rho</TabsTrigger>
                <TabsTrigger value="vanna" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vanna</TabsTrigger>
                <TabsTrigger value="volga" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Volga</TabsTrigger>
              </TabsList>

              <TabsContent value="price">
                <GreeksChart
                  data={chartData}
                  dataKey="price"
                  title="Option Price"
                  color={greekColors.price}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="delta">
                <GreeksChart
                  data={chartData}
                  dataKey="delta"
                  title="Delta"
                  color={greekColors.delta}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="gamma">
                <GreeksChart
                  data={chartData}
                  dataKey="gamma"
                  title="Gamma"
                  color={greekColors.gamma}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="vega">
                <GreeksChart
                  data={chartData}
                  dataKey="vega"
                  title="Vega"
                  color={greekColors.vega}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="theta">
                <GreeksChart
                  data={chartData}
                  dataKey="theta"
                  title="Theta"
                  color={greekColors.theta}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="rho">
                <GreeksChart
                  data={chartData}
                  dataKey="rho"
                  title="Rho"
                  color={greekColors.rho}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="vanna">
                <GreeksChart
                  data={chartData}
                  dataKey="vanna"
                  title="Vanna"
                  color={greekColors.vanna}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="volga">
                <GreeksChart
                  data={chartData}
                  dataKey="volga"
                  title="Volga"
                  color={greekColors.volga}
                  currentPrice={currentPrice}
                  strikePrice={strikePrice}
                />
              </TabsContent>

              <TabsContent value="all">
                <div className="grid gap-3 md:grid-cols-2">
                  <GreeksChart
                    data={chartData}
                    dataKey="price"
                    title="Option Price"
                    color={greekColors.price}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="delta"
                    title="Delta"
                    color={greekColors.delta}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="gamma"
                    title="Gamma"
                    color={greekColors.gamma}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="vega"
                    title="Vega"
                    color={greekColors.vega}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="theta"
                    title="Theta"
                    color={greekColors.theta}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="rho"
                    title="Rho"
                    color={greekColors.rho}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="vanna"
                    title="Vanna"
                    color={greekColors.vanna}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                  <GreeksChart
                    data={chartData}
                    dataKey="volga"
                    title="Volga"
                    color={greekColors.volga}
                    currentPrice={currentPrice}
                    strikePrice={strikePrice}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
