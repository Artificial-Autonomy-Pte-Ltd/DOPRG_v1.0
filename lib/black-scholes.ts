// Black-Scholes Option Pricing Model with Greeks

// Standard normal cumulative distribution function
function normCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal probability density function
function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Calculate d1 and d2 for Black-Scholes
function calculateD1D2(
  S: number, // Spot price
  K: number, // Strike price
  T: number, // Time to expiration (in years)
  r: number, // Risk-free rate
  sigma: number // Volatility
): { d1: number; d2: number } {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

// Black-Scholes Option Price
export function optionPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  optionType: 'call' | 'put'
): number {
  if (T <= 0) {
    // At expiration
    if (optionType === 'call') {
      return Math.max(S - K, 0);
    } else {
      return Math.max(K - S, 0);
    }
  }

  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);

  if (optionType === 'call') {
    return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
  }
}

// Delta: Rate of change of option price with respect to underlying price
export function delta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  optionType: 'call' | 'put'
): number {
  if (T <= 0) return optionType === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
  
  const { d1 } = calculateD1D2(S, K, T, r, sigma);

  if (optionType === 'call') {
    return normCDF(d1);
  } else {
    return normCDF(d1) - 1;
  }
}

// Gamma: Rate of change of delta with respect to underlying price
export function gamma(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;
  
  const { d1 } = calculateD1D2(S, K, T, r, sigma);
  return normPDF(d1) / (S * sigma * Math.sqrt(T));
}

// Vega: Rate of change of option price with respect to volatility
export function vega(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;
  
  const { d1 } = calculateD1D2(S, K, T, r, sigma);
  return S * normPDF(d1) * Math.sqrt(T) / 100; // Divided by 100 for 1% change in vol
}

// Theta: Rate of change of option price with respect to time (daily)
export function theta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  optionType: 'call' | 'put'
): number {
  if (T <= 0) return 0;
  
  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);
  const sqrtT = Math.sqrt(T);

  const term1 = -(S * normPDF(d1) * sigma) / (2 * sqrtT);

  if (optionType === 'call') {
    const term2 = r * K * Math.exp(-r * T) * normCDF(d2);
    return (term1 - term2) / 365; // Daily theta
  } else {
    const term2 = r * K * Math.exp(-r * T) * normCDF(-d2);
    return (term1 + term2) / 365; // Daily theta
  }
}

// Rho: Rate of change of option price with respect to risk-free rate
export function rho(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  optionType: 'call' | 'put'
): number {
  if (T <= 0) return 0;
  
  const { d2 } = calculateD1D2(S, K, T, r, sigma);

  if (optionType === 'call') {
    return (K * T * Math.exp(-r * T) * normCDF(d2)) / 100; // Per 1% change in rate
  } else {
    return (-K * T * Math.exp(-r * T) * normCDF(-d2)) / 100;
  }
}

// Vanna: Sensitivity of delta to changes in volatility (d²V/dS dσ)
export function vanna(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;
  
  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);
  return -normPDF(d1) * d2 / sigma;
}

// Volga (Vomma): Sensitivity of vega to changes in volatility (d²V/dσ²)
export function volga(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;
  
  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);
  const vegaVal = vega(S, K, T, r, sigma) * 100; // Un-normalize vega
  return vegaVal * d1 * d2 / sigma;
}

// Generate data points for charts
export function generateGreeksData(
  currentPrice: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  optionType: 'call' | 'put',
  range: number = 0.3 // 30% range around current price
): Array<{
  underlying: number;
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
  vanna: number;
  volga: number;
}> {
  const data = [];
  const minPrice = currentPrice * (1 - range);
  const maxPrice = currentPrice * (1 + range);
  const step = (maxPrice - minPrice) / 100;

  for (let S = minPrice; S <= maxPrice; S += step) {
    data.push({
      underlying: Number(S.toFixed(2)),
      price: Number(optionPrice(S, K, T, r, sigma, optionType).toFixed(4)),
      delta: Number(delta(S, K, T, r, sigma, optionType).toFixed(4)),
      gamma: Number(gamma(S, K, T, r, sigma).toFixed(4)),
      vega: Number(vega(S, K, T, r, sigma).toFixed(4)),
      theta: Number(theta(S, K, T, r, sigma, optionType).toFixed(4)),
      rho: Number(rho(S, K, T, r, sigma, optionType).toFixed(4)),
      vanna: Number(vanna(S, K, T, r, sigma).toFixed(4)),
      volga: Number(volga(S, K, T, r, sigma).toFixed(4)),
    });
  }

  return data;
}

// Calculate intrinsic value for payoff diagram
export function intrinsicValue(
  S: number,
  K: number,
  optionType: 'call' | 'put'
): number {
  if (optionType === 'call') {
    return Math.max(S - K, 0);
  } else {
    return Math.max(K - S, 0);
  }
}
