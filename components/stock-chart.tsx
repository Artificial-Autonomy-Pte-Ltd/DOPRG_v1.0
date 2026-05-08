'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';

interface HistoricalData {
  date: string;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: HistoricalData[];
  symbol: string;
}

export function StockChart({ data, symbol }: StockChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), 'MMM dd'),
    fullDate: format(new Date(d.date), 'MMM dd, yyyy'),
    price: d.close,
  }));

  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.02;
  
  // Determine if overall trend is positive or negative
  const isPositive = chartData.length > 1 && chartData[chartData.length - 1].price >= chartData[0].price;
  const chartColor = isPositive ? '#0ECB81' : '#F6465D';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#848E9C' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 10, fill: '#848E9C' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                    <p className="text-sm font-medium text-foreground font-mono">{symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {payload[0].payload.fullDate}
                    </p>
                    <p className="text-lg font-bold font-mono" style={{ color: chartColor }}>
                      ${Number(payload[0].value).toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
