'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';

interface GreeksData {
  underlying: number;
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
  vanna: number;
  volga: number;
}

interface GreeksChartProps {
  data: GreeksData[];
  dataKey: keyof Omit<GreeksData, 'underlying'>;
  title: string;
  color: string;
  currentPrice: number;
  strikePrice: number;
}

const greekDescriptions: Record<string, string> = {
  price: 'Option value at different underlying prices',
  delta: 'Rate of change per $1 move in underlying',
  gamma: 'Rate of change of delta per $1 move',
  vega: 'Sensitivity to 1% change in IV',
  theta: 'Daily time decay (in dollars)',
  rho: 'Sensitivity to 1% change in rate',
  vanna: 'Delta sensitivity to volatility',
  volga: 'Vega sensitivity to volatility',
};

export function GreeksChart({
  data,
  dataKey,
  title,
  color,
  currentPrice,
  strikePrice,
}: GreeksChartProps) {
  const values = data.map((d) => d[dataKey] as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1 || 0.1;

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{greekDescriptions[dataKey]}</p>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
            <XAxis
              dataKey="underlying"
              tick={{ fontSize: 9, fill: '#848E9C' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis
              domain={[minValue - padding, maxValue + padding]}
              tick={{ fontSize: 9, fill: '#848E9C' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                      <p className="text-xs text-muted-foreground font-mono">
                        Underlying: ${payload[0].payload.underlying.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold font-mono" style={{ color }}>
                        {title}: {Number(payload[0].value).toFixed(4)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              x={currentPrice}
              stroke="#848E9C"
              strokeDasharray="5 5"
              label={{
                value: 'Spot',
                position: 'top',
                fill: '#848E9C',
                fontSize: 9,
              }}
            />
            <ReferenceLine
              x={strikePrice}
              stroke="#F6465D"
              strokeDasharray="3 3"
              label={{
                value: 'K',
                position: 'top',
                fill: '#F6465D',
                fontSize: 9,
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
